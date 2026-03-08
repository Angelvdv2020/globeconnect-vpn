import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hwid, x-device-os, x-ver-os, x-device-model",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getSupabaseClient(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
}

async function getUser(req: Request) {
  const supabase = getSupabaseClient(req);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null, error: "unauthorized" };
  return { supabase, user, error: null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").filter(Boolean);
  // path[0] = "vpn-api", path[1] = action
  const action = path[1] ?? "";

  try {
    switch (action) {
      // ─── GET /vpn-api/status ───
      // Returns subscription status, profile, device count
      case "status": {
        const { supabase, user, error } = await getUser(req);
        if (error) return json({ error: "unauthorized" }, 401);

        const [subRes, profileRes, deviceRes] = await Promise.all([
          supabase.rpc("get_subscription_status"),
          supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
          supabase.rpc("get_device_count", { _user_id: user!.id }),
        ]);

        return json({
          subscription: subRes.data,
          profile: profileRes.data
            ? {
                display_name: profileRes.data.display_name,
                email: profileRes.data.email,
                balance: profileRes.data.balance,
                max_devices: profileRes.data.max_devices,
              }
            : null,
          device_count: deviceRes.data ?? 0,
        });
      }

      // ─── POST /vpn-api/register-device ───
      // Headers: x-hwid, x-device-os, x-ver-os, x-device-model
      case "register-device": {
        const { supabase, user, error } = await getUser(req);
        if (error) return json({ error: "unauthorized" }, 401);

        const hwid = req.headers.get("x-hwid");
        if (!hwid) return json({ error: "missing_hwid", message: "x-hwid header required" }, 400);

        const result = await supabase.rpc("register_device", {
          _hwid: hwid,
          _device_os: req.headers.get("x-device-os"),
          _os_version: req.headers.get("x-ver-os"),
          _device_model: req.headers.get("x-device-model"),
          _user_agent: req.headers.get("user-agent"),
        });

        if (result.error) return json({ error: "db_error", message: result.error.message }, 500);
        return json(result.data);
      }

      // ─── POST /vpn-api/reset-devices ───
      case "reset-devices": {
        const { supabase, user, error } = await getUser(req);
        if (error) return json({ error: "unauthorized" }, 401);

        const result = await supabase.rpc("reset_user_devices");
        if (result.error) return json({ error: "db_error", message: result.error.message }, 500);
        return json({ ok: true });
      }

      // ─── GET /vpn-api/devices ───
      case "devices": {
        const { supabase, user, error } = await getUser(req);
        if (error) return json({ error: "unauthorized" }, 401);

        const { data, error: dbErr } = await supabase
          .from("user_devices")
          .select("id, hwid, device_os, os_version, device_model, is_active, last_seen_at")
          .eq("user_id", user!.id)
          .order("last_seen_at", { ascending: false });

        if (dbErr) return json({ error: "db_error", message: dbErr.message }, 500);
        return json({ devices: data });
      }

      // ─── POST /vpn-api/import-key ───
      // Body: { key_value, key_type?, label? }
      case "import-key": {
        const { supabase, user, error } = await getUser(req);
        if (error) return json({ error: "unauthorized" }, 401);

        const body = await req.json();
        if (!body.key_value) return json({ error: "missing_key", message: "key_value required" }, 400);

        const keyType = body.key_type || (body.key_value.startsWith("vless://") ? "vless" : "subscription");

        const result = await supabase.rpc("import_vpn_key", {
          _key_value: body.key_value,
          _key_type: keyType,
          _label: body.label || null,
        });

        if (result.error) return json({ error: "db_error", message: result.error.message }, 500);
        return json(result.data);
      }

      // ─── GET /vpn-api/keys ───
      case "keys": {
        const { supabase, user, error } = await getUser(req);
        if (error) return json({ error: "unauthorized" }, 401);

        const { data, error: dbErr } = await supabase
          .from("vpn_keys")
          .select("id, key_type, key_value, label, endpoints, is_active, imported_at")
          .eq("user_id", user!.id)
          .eq("is_active", true)
          .order("imported_at", { ascending: false });

        if (dbErr) return json({ error: "db_error", message: dbErr.message }, 500);
        return json({ keys: data });
      }

      // ─── DELETE /vpn-api/keys/:id ───
      case "keys" && path[2]: {
        // This won't match above because of the condition; handle in default
        break;
      }

      // ─── GET /vpn-api/check-apk ───
      // Returns whether user can download APK (active subscription)
      case "check-apk": {
        const { supabase, user, error } = await getUser(req);
        if (error) return json({ error: "unauthorized" }, 401);

        const subRes = await supabase.rpc("get_subscription_status");
        const active = subRes.data?.active === true;
        
        return json({
          can_download: active,
          message: active ? "APK download available" : "Active subscription required to download APK",
        });
      }

      default: {
        // Handle DELETE /vpn-api/keys/:id
        if (path[1] === "keys" && path[2] && req.method === "DELETE") {
          const { supabase, user, error } = await getUser(req);
          if (error) return json({ error: "unauthorized" }, 401);

          const { error: dbErr } = await supabase
            .from("vpn_keys")
            .delete()
            .eq("id", path[2])
            .eq("user_id", user!.id);

          if (dbErr) return json({ error: "db_error", message: dbErr.message }, 500);
          return json({ ok: true });
        }

        return json({ error: "not_found", endpoints: [
          "GET  /vpn-api/status",
          "POST /vpn-api/register-device",
          "POST /vpn-api/reset-devices",
          "GET  /vpn-api/devices",
          "POST /vpn-api/import-key",
          "GET  /vpn-api/keys",
          "DELETE /vpn-api/keys/:id",
          "GET  /vpn-api/check-apk",
        ]}, 404);
      }
    }
  } catch (e) {
    return json({ error: "internal_error", message: String(e) }, 500);
  }

  return json({ error: "not_found" }, 404);
});
