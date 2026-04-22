-- Track how many eBay listings contributed to each price check.
-- NULL for scraper-based checks; populated for eBay API checks.
-- Lets the UI show confidence levels ("based on 2 listings").
ALTER TABLE price_check_log
  ADD COLUMN IF NOT EXISTS ebay_listing_count INTEGER DEFAULT NULL;

-- ---------------------------------------------------------------------------
-- Atomic success handler
-- Inserts the price_check_log row and updates items in a single transaction,
-- eliminating the ghost-data risk when the function crashes mid-flight.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_price_check_success(
  p_item_id             UUID,
  p_user_id             UUID,
  p_price               DECIMAL(10,2),
  p_source              VARCHAR(50),
  p_retailer            VARCHAR(100),
  p_lowest_price_seen   DECIMAL(10,2),
  p_target_alert_sent_at TIMESTAMP WITH TIME ZONE,
  p_ebay_listing_count  INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO price_check_log
    (item_id, user_id, price, checked_at, source, retailer, success, ebay_listing_count)
  VALUES
    (p_item_id, p_user_id, p_price, NOW(), p_source, p_retailer, TRUE, p_ebay_listing_count);

  UPDATE items SET
    price_check_failures   = 0,
    last_price_check_at    = NOW(),
    sale_price             = p_price,
    lowest_price_seen      = p_lowest_price_seen,
    target_alert_sent_at   = p_target_alert_sent_at
  WHERE id = p_item_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- Atomic failure handler
-- Inserts the price_check_log row and updates items in a single transaction.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_price_check_failure(
  p_item_id                    UUID,
  p_user_id                    UUID,
  p_source                     VARCHAR(50),
  p_retailer                   VARCHAR(100),
  p_error_message              TEXT,
  p_error_category             VARCHAR(50),
  p_http_status_code           INTEGER,
  p_new_failure_count          INTEGER,
  p_auto_price_tracking_enabled BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO price_check_log
    (item_id, user_id, checked_at, source, retailer, success,
     error_message, error_category, http_status_code)
  VALUES
    (p_item_id, p_user_id, NOW(), p_source, p_retailer, FALSE,
     p_error_message, p_error_category, p_http_status_code);

  UPDATE items SET
    price_check_failures      = p_new_failure_count,
    last_price_check_at       = NOW(),
    auto_price_tracking_enabled = p_auto_price_tracking_enabled
  WHERE id = p_item_id;
END;
$$;
