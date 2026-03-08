import { useState, useEffect, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import Globe3D from "@/components/Globe3D";
import VpnButton from "@/components/VpnButton";
import SpeedIndicator from "@/components/SpeedIndicator";
import ModeSwitch from "@/components/ModeSwitch";
import ScenarioCards from "@/components/ScenarioCards";
import SubscriptionButtons from "@/components/SubscriptionButtons";
import TopBar from "@/components/TopBar";
import ServerList from "@/components/ServerList";
import SettingsPanel from "@/components/SettingsPanel";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [scenario, setScenario] = useState("web");
  const [selectedServer, setSelectedServer] = useState("de");
  const [showServers, setShowServers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [upload, setUpload] = useState(0);
  const [download, setDownload] = useState(0);

  const toggleVpn = useCallback(() => {
    if (isConnecting) return;
    if (isConnected) {
      setIsConnected(false);
      setUpload(0);
      setDownload(0);
    } else {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
      }, 2000);
    }
  }, [isConnected, isConnecting]);

  // Simulate speed updates
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setUpload(Math.random() * 15 + 5);
      setDownload(Math.random() * 45 + 20);
    }, 1500);
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative overflow-hidden">
      <TopBar
        onOpenServers={() => setShowServers(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-6 gap-5">
        {/* Globe */}
        <Suspense fallback={<div className="w-full h-[280px] flex items-center justify-center text-muted-foreground">Загрузка...</div>}>
          <Globe3D isConnected={isConnected || isConnecting} />
        </Suspense>

        {/* VPN Button */}
        <VpnButton
          isConnected={isConnected}
          isConnecting={isConnecting}
          onToggle={toggleVpn}
        />

        {/* Speed */}
        <SpeedIndicator isConnected={isConnected} upload={upload} download={download} />

        {/* Mode Switch */}
        <ModeSwitch mode={mode} onModeChange={setMode} />

        {/* Scenarios */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-muted-foreground mb-2 font-medium">Сценарий подключения</p>
          <ScenarioCards active={scenario} onSelect={setScenario} />
        </motion.div>

        {/* Subscription */}
        <div className="w-full">
          <SubscriptionButtons hasSubscription={true} />
        </div>
      </div>

      {/* Overlays */}
      <ServerList
        isOpen={showServers}
        selectedServer={selectedServer}
        onSelect={setSelectedServer}
        onClose={() => setShowServers(false)}
      />
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
