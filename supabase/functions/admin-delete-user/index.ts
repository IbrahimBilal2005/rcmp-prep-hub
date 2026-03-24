import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase service role configuration.");
}

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
      return Response.json({ error: userError?.message || "Unable to resolve authenticated user." }, { status: 401, headers: corsHeaders });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return Response.json({ error: "Admin access is required." }, { status: 403, headers: corsHeaders });
    }

    const body = await request.json();
    const userId = typeof body?.userId === "string" ? body.userId : "";

    if (!userId) {
      return Response.json({ error: "Missing user id." }, { status: 400, headers: corsHeaders });
    }

    if (userId === user.id) {
      return Response.json({ error: "Admins cannot delete their own account from this screen." }, { status: 400, headers: corsHeaders });
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 400, headers: corsHeaders });
    }

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete user.";
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});
