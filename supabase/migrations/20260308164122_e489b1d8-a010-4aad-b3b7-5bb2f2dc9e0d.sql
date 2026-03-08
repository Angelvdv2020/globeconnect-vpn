
-- 1. Function: check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- 2. Function: get user device count
CREATE OR REPLACE FUNCTION public.get_device_count(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*)::integer, 0)
  FROM public.user_devices
  WHERE user_id = _user_id AND is_active = true;
$$;

-- 3. Function: get user max devices
CREATE OR REPLACE FUNCTION public.get_max_devices(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(max_devices, 3)
  FROM public.profiles
  WHERE user_id = _user_id;
$$;

-- 4. Function: enforce device limit on insert (trigger)
CREATE OR REPLACE FUNCTION public.enforce_device_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  max_allowed integer;
BEGIN
  SELECT public.get_device_count(NEW.user_id) INTO current_count;
  SELECT public.get_max_devices(NEW.user_id) INTO max_allowed;
  
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Device limit reached. Maximum % devices allowed.', max_allowed;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_device_limit
BEFORE INSERT ON public.user_devices
FOR EACH ROW EXECUTE FUNCTION public.enforce_device_limit();

-- 5. Function: enforce active subscription on key import (trigger)
CREATE OR REPLACE FUNCTION public.enforce_subscription_for_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_active_subscription(NEW.user_id) THEN
    RAISE EXCEPTION 'Active subscription required to import keys.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_subscription_for_key
BEFORE INSERT ON public.vpn_keys
FOR EACH ROW EXECUTE FUNCTION public.enforce_subscription_for_key();

-- 6. Function: reset all devices for a user (callable via RPC)
CREATE OR REPLACE FUNCTION public.reset_user_devices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_devices WHERE user_id = auth.uid();
END;
$$;

-- 7. Function: register device with limit check (callable via RPC)
CREATE OR REPLACE FUNCTION public.register_device(
  _hwid text,
  _device_os text DEFAULT NULL,
  _os_version text DEFAULT NULL,
  _device_model text DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  current_count integer;
  max_allowed integer;
  result_device user_devices%ROWTYPE;
BEGIN
  -- Check subscription
  IF NOT public.has_active_subscription(_user_id) THEN
    RETURN jsonb_build_object('error', 'no_active_subscription', 'message', 'Active subscription required.');
  END IF;

  -- Check if device already registered
  SELECT * INTO result_device FROM public.user_devices
  WHERE user_id = _user_id AND hwid = _hwid;
  
  IF FOUND THEN
    -- Update last seen
    UPDATE public.user_devices SET last_seen_at = now(), is_active = true
    WHERE id = result_device.id;
    RETURN jsonb_build_object('ok', true, 'device_id', result_device.id, 'status', 'existing');
  END IF;

  -- Check limit
  SELECT public.get_device_count(_user_id) INTO current_count;
  SELECT public.get_max_devices(_user_id) INTO max_allowed;
  
  IF current_count >= max_allowed THEN
    RETURN jsonb_build_object('error', 'device_limit_reached', 'message', format('Maximum %s devices allowed. Reset devices to add new ones.', max_allowed), 'current', current_count, 'max', max_allowed);
  END IF;

  -- Register new device
  INSERT INTO public.user_devices (user_id, hwid, device_os, os_version, device_model, user_agent)
  VALUES (_user_id, _hwid, _device_os, _os_version, _device_model, _user_agent)
  RETURNING * INTO result_device;

  RETURN jsonb_build_object('ok', true, 'device_id', result_device.id, 'status', 'new');
END;
$$;

-- 8. Function: get subscription status (callable via RPC)
CREATE OR REPLACE FUNCTION public.get_subscription_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub subscriptions%ROWTYPE;
  days_left integer;
BEGIN
  SELECT * INTO sub FROM public.subscriptions
  WHERE user_id = auth.uid() AND status = 'active' AND (expires_at IS NULL OR expires_at > now())
  ORDER BY expires_at DESC NULLS LAST
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('active', false, 'plan', 'none', 'days_left', 0);
  END IF;

  IF sub.expires_at IS NOT NULL THEN
    days_left := GREATEST(0, EXTRACT(DAY FROM sub.expires_at - now())::integer);
  ELSE
    days_left := -1; -- unlimited
  END IF;

  RETURN jsonb_build_object('active', true, 'plan', sub.plan, 'status', sub.status, 'expires_at', sub.expires_at, 'days_left', days_left);
END;
$$;

-- 9. Function: import key with subscription check (callable via RPC)
CREATE OR REPLACE FUNCTION public.import_vpn_key(
  _key_value text,
  _key_type text DEFAULT 'vless',
  _label text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  new_key vpn_keys%ROWTYPE;
BEGIN
  IF NOT public.has_active_subscription(_user_id) THEN
    RETURN jsonb_build_object('error', 'no_active_subscription', 'message', 'Active subscription required to import keys.');
  END IF;

  INSERT INTO public.vpn_keys (user_id, key_value, key_type, label)
  VALUES (_user_id, _key_value, _key_type, COALESCE(_label, _key_type || ' key'))
  RETURNING * INTO new_key;

  RETURN jsonb_build_object('ok', true, 'key_id', new_key.id);
END;
$$;
