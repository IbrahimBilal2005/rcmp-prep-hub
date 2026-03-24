import Stripe from "npm:stripe@18.3.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!stripeSecretKey || !stripeWebhookSecret) {
  throw new Error("Missing Stripe webhook secrets.");
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase service role configuration.");
}

const stripe = new Stripe(stripeSecretKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

Deno.serve(async (request) => {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header.", { status: 400 });
    }

    const body = await request.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan === "premium" ? "premium" : "free";
      const customerId = typeof session.customer === "string" ? session.customer : null;

      if (userId) {
        const accessExpiresAt = new Date();
        accessExpiresAt.setUTCMonth(accessExpiresAt.getUTCMonth() + 6);

        await supabaseAdmin
          .from("profiles")
          .update({
            plan,
            access_expires_at: accessExpiresAt.toISOString(),
          })
          .eq("id", userId);

        await supabaseAdmin
          .from("billing_accounts")
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_price_id: session.metadata?.price_id || null,
              billing_status: "paid",
              current_period_end: accessExpiresAt.toISOString(),
            },
            { onConflict: "user_id" },
          );
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handling failed.";
    return new Response(message, { status: 400 });
  }
});
