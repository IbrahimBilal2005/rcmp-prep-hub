import Stripe from "npm:stripe@18.3.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY secret.");
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY secret.");
}

const stripe = new Stripe(stripeSecretKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return Response.json({ error: "Missing authorization header." }, { status: 401, headers: corsHeaders });
    }

    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return Response.json({ error: userError?.message || "Unable to resolve authenticated user from JWT." }, { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const priceId = typeof body?.priceId === "string" ? body.priceId : "";
    const plan = typeof body?.plan === "string" ? body.plan : "premium";

    if (!priceId) {
      return Response.json({ error: "Missing Stripe price id." }, { status: 400, headers: corsHeaders });
    }

    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined,
      metadata: {
        user_id: user.id,
      },
    });

    const origin = request.headers.get("origin") || new URL(request.url).origin;
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/signup?step=plan&checkout=cancelled`,
      metadata: {
        user_id: user.id,
        plan,
        price_id: priceId,
      },
    });

    return Response.json({ url: checkoutSession.url }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout session.";
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
