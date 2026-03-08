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
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
          isConnected ? "vpn-button-active" : "vpn-button-idle"
        }`}
        whileTap={{ scale: 0.92 }}
        animate={isConnecting ? { scale: [1, 1.05, 1] } : {}}
        transition={isConnecting ? { repeat: Infinity, duration: 1 } : {}}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-[-6px] rounded-full border-2"
          style={{
            borderColor: isConnected
              ? "hsl(190 100% 50% / 0.3)"
              : "hsl(32 100% 50% / 0.2)",
          }}
          animate={isConnected ? { scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />

        {isConnected ? (
          <Pause className="w-8 h-8 text-foreground" />
        ) : (
          <Power className="w-8 h-8 text-foreground" />
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
          ? "Отключить VPN"
          : "Подключить VPN"}
      </motion.p>
    </div>
  );
}
