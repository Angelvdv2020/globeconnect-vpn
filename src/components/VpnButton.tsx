import { motion } from "framer-motion";
import { Power, Pause } from "lucide-react";

interface VpnButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  onToggle: () => void;
}

export default function VpnButton({ isConnected, isConnecting, onToggle }: VpnButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={onToggle}
        disabled={isConnecting}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
          isConnected ? "vpn-button-active" : "vpn-button-idle"
        }`}
        whileTap={{ scale: 0.92 }}
        animate={isConnecting ? { scale: [1, 1.05, 1] } : {}}
        transition={isConnecting ? { repeat: Infinity, duration: 1 } : {}}
      >
        {isConnected ? (
          <Pause className="w-9 h-9 text-primary-foreground" />
        ) : (
          <Power className="w-9 h-9 text-primary-foreground" />
        )}
      </motion.button>

      <motion.p
        className="text-sm font-medium text-muted-foreground"
        key={isConnecting ? "connecting" : isConnected ? "connected" : "disconnected"}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {isConnecting
          ? "Подключение..."
          : isConnected
          ? "Отключить"
          : "Подключить"}
      </motion.p>
    </div>
  );
}
