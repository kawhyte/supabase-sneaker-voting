-- Migration: Create push_subscriptions table for Web Push notifications
-- This table stores browser push notification subscriptions for users

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    -- Constraints
    CONSTRAINT push_subscriptions_unique UNIQUE(user_name, endpoint)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_name ON push_subscriptions(user_name);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Enable Row Level Security (RLS)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only manage their own subscriptions
CREATE POLICY "Users can view own subscriptions"
ON push_subscriptions
FOR SELECT
USING (user_name = current_user OR user_name = (current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own subscriptions"
ON push_subscriptions
FOR INSERT
WITH CHECK (user_name = current_user OR user_name = (current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own subscriptions"
ON push_subscriptions
FOR UPDATE
USING (user_name = current_user OR user_name = (current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own subscriptions"
ON push_subscriptions
FOR DELETE
USING (user_name = current_user OR user_name = (current_setting('request.jwt.claims', true)::json->>'email'));

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE push_subscriptions IS 'Stores browser push notification subscriptions for price alerts';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Push service endpoint URL';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Public key for encryption';
COMMENT ON COLUMN push_subscriptions.auth IS 'Authentication secret for push service';
COMMENT ON COLUMN push_subscriptions.is_active IS 'Whether subscription is currently active';