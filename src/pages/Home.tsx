import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import VpnButton from "@/components/VpnButton";
import SpeedIndicator from "@/components/SpeedIndicator";
import ModeSwitch from "@/components/ModeSwitch";
import ScenarioCards from "@/components/ScenarioCards";
import TopBar from "@/components/TopBar";
import ServerList from "@/components/ServerList";
import SettingsPanel from "@/components/SettingsPanel";
import VpnSettings from "@/components/VpnSettings";
import SessionTimer from "@/components/SessionTimer";
import StatusBanner from "@/components/StatusBanner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ParsedEndpoint {
  id: string;
  address: string;
  port: number;
  label: string;
  protocol: string;
}

function parseVlessEndpoints(keyValue: string): ParsedEndpoint[] {
  try {
    if (keyValue.startsWith("vless://")) {
      const url = new URL(keyValue.replace("vless://", "https://"));
      return [{
        id: keyValue.slice(0, 16),
        address: url.hostname,
        port: parseInt(url.port) || 443,
        label: url.hash?.replace("#", "") || url.hostname,
        protocol: "VLESS"
      }];
    }
  } catch {}
  return [];
}

export default function Home() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [scenario, setScenario] = useState("web");
  const [selectedServer, setSelectedServer] = useState("");
  const [showServers, setShowServers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVpnSettings, setShowVpnSettings] = useState(false);
  const [upload, setUpload] = useState(0);
  const [download, setDownload] = useState(0);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasKeys, setHasKeys] = useState(false);
  const [servers, setServers] = useState<ParsedEndpoint[]>([]);
  const [subDaysLeft, setSubDaysLeft] = useState(0);

  // Load real data
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [subRes, keysRes] = await Promise.all([
      supabase.rpc("get_subscription_status"),
      supabase.from("vpn_keys").select("*").eq("user_id", user.id).eq("is_active", true)]
      );
      if (subRes.data) {
        const sub = subRes.data as any;
        setHasSubscription(sub.active === true);
        setSubDaysLeft(sub.days_left ?? 0);
      }
      if (keysRes.data && keysRes.data.length > 0) {
        setHasKeys(true);
        const endpoints: ParsedEndpoint[] = [];
        for (const key of keysRes.data) {
          endpoints.push(...parseVlessEndpoints(key.key_value));
        }
        setServers(endpoints);
        if (endpoints.length > 0 && !selectedServer) {
          setSelectedServer(endpoints[0].id);
        }
      }
    };
    load();
  }, [user]);

  const toggleVpn = useCallback(() => {
    if (isConnecting) return;

    if (!user) {
      toast.error("Сначала войдите в аккаунт");
      return;
    }
    if (!hasSubscription) {
      toast.error("Требуется активная подписка");
      return;
    }
    if (!hasKeys) {
      toast.error("Сначала импортируйте ключ в Личном кабинете");
      return;
    }

    if (isConnected) {
      setIsConnected(false);
      setUpload(0);
      setDownload(0);
      setSessionStart(null);
    } else {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        setSessionStart(new Date());
        toast.info("Режим доступа активен. Реальный VPN-туннель требует нативное приложение.");
      }, 1500);
    }
  }, [isConnected, isConnecting, user, hasSubscription, hasKeys]);

  // Simulated speed (for UI demo only - clearly labeled)
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setUpload(Math.random() * 15 + 5);
      setDownload(Math.random() * 45 + 20);
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-background flex flex-col w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto relative">
      <TopBar
        onOpenServers={() => setShowServers(true)}
        onOpenSettings={() => setShowSettings(true)} />
      

      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 md:px-8 pb-6 gap-4 md:gap-5 opacity-100">
        {/* Status Banner */}
        <StatusBanner
          isLoggedIn={!!user}
          hasSubscription={hasSubscription}
          hasKeys={hasKeys}
          daysLeft={subDaysLeft} />
        

        {/* VPN Button */}
        <div className="py-4">
          <VpnButton
            isConnected={isConnected}
            isConnecting={isConnecting}
            onToggle={toggleVpn} />
          
        </div>

        {/* Session Timer */}
        {isConnected && sessionStart && <SessionTimer startTime={sessionStart} />}

        {/* Speed */}
        <SpeedIndicator isConnected={isConnected} upload={upload} download={download} />

        {/* Mode Switch */}
        <ModeSwitch mode={mode} onModeChange={setMode} />

        {/* Scenarios */}
        <div className="w-full">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Сценарий</p>
          <ScenarioCards active={scenario} onSelect={setScenario} />
        </div>

        {/* Selected server */}
        {mode === "manual" && servers.length > 0 &&
        <button
          onClick={() => setShowServers(true)}
          className="card-surface w-full p-3 flex items-center justify-between">
          
            <span className="text-sm text-foreground font-medium">
              Сервер: {servers.find((s) => s.id === selectedServer)?.label || "Не выбран"}
            </span>
            <span className="text-xs text-muted-foreground">Изменить →</span>
          </button>
        }

        {/* VPN Settings button */}
        <button
          onClick={() => setShowVpnSettings(true)}
          className="card-surface w-full p-3 text-sm text-muted-foreground text-left font-medium">
          
          ⚙ VPN-настройки
        </button>
      </div>

      {/* Overlays */}
      <ServerList
        isOpen={showServers}
        servers={servers}
        selectedServer={selectedServer}
        onSelect={setSelectedServer}
        onClose={() => setShowServers(false)} />
      
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)} />
      
      <VpnSettings
        isOpen={showVpnSettings}
        onClose={() => setShowVpnSettings(false)} />
      
    </div>);

}