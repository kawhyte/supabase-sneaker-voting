-- Add persistent flag to track whether a target-price alert has fired for the
-- current pricing period. Prevents the rolling 7-day window from re-alerting
-- the user every week while the price stays below their target.
--
-- Logic (enforced in application code):
--   - NULL  → alert has not fired yet for this period; send it when price ≤ target
--   - set   → alert already sent; suppress further alerts
--   - reset to NULL when price rises above target (new pricing period begins)

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS target_alert_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
