Stripe function setup

1. Deploy `create-checkout-session`
2. Deploy `stripe-webhook`
3. Set these Supabase Edge Function secrets:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

Webhook URL after deploy:

`https://enzfmuclxdbrjrfaivcg.supabase.co/functions/v1/stripe-webhook`
