import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Wifi, Globe, RefreshCw } from "lucide-react";

interface VpnSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VpnSettings({ isOpen, onClose }: VpnSettingsProps) {
  const [vpnMode, setVpnMode] = useState<"vpn" | "proxy">("vpn");
  const [ipv6, setIpv6] = useState(false);
  const [dns1, setDns1] = useState("1.1.1.1");
  const [dns2, setDns2] = useState("8.8.8.8");
  const [autoReconnect, setAutoReconnect] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col max-w-md mx-auto"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground">VPN-настройки</h2>
          </div>

          <div className="flex-1 px-4 py-4 space-y-4">
            {/* VPN / Proxy */}
            <div className="card-surface p-4">
              <p className="text-xs text-muted-foreground mb-3 font-medium">Режим подключения</p>
              <div className="flex rounded-xl bg-secondary p-1">
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    vpnMode === "vpn" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                  onClick={() => setVpnMode("vpn")}
                >
                  <Shield className="w-4 h-4 inline mr-1" /> VPN
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    vpnMode === "proxy" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                  onClick={() => setVpnMode("proxy")}
                >
                  <Wifi className="w-4 h-4 inline mr-1" /> Proxy
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {vpnMode === "vpn"
                  ? "Полный туннель через VPN (требует нативное приложение)"
                  : "Прокси-режим для отдельных приложений"}
              </p>
            </div>

            {/* IPv6 */}
            <div className="card-surface p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">IPv6</p>
                <p className="text-[11px] text-muted-foreground">Включить поддержку IPv6</p>
              </div>
              <button
                onClick={() => setIpv6(!ipv6)}
                className={`w-12 h-7 rounded-full transition-all ${
                  ipv6 ? "bg-primary" : "bg-secondary"
                } relative`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${
                  ipv6 ? "left-6" : "left-1"
                }`} />
              </button>
            </div>

            {/* DNS */}
            <div className="card-surface p-4 space-y-3">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Globe className="w-3 h-3" /> DNS серверы
              </p>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-muted-foreground">DNS 1</label>
                  <input
                    value={dns1}
                    onChange={(e) => setDns1(e.target.value)}
                    className="w-full mt-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground mono-text outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">DNS 2</label>
                  <input
                    value={dns2}
                    onChange={(e) => setDns2(e.target.value)}
                    className="w-full mt-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground mono-text outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Auto-reconnect */}
            <div className="card-surface p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Автопереподключение</p>
                  <p className="text-[11px] text-muted-foreground">Автоматически восстанавливать связь</p>
                </div>
              </div>
              <button
                onClick={() => setAutoReconnect(!autoReconnect)}
                className={`w-12 h-7 rounded-full transition-all ${
                  autoReconnect ? "bg-primary" : "bg-secondary"
                } relative`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${
                  autoReconnect ? "left-6" : "left-1"
                }`} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
