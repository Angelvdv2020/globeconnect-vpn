import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

interface SpeedIndicatorProps {
  isConnected: boolean;
  upload: number;
  download: number;
}

export default function SpeedIndicator({ isConnected, upload, download }: SpeedIndicatorProps) {
  return (
    <motion.div
      className="flex items-center justify-center gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <ArrowUp className="w-4 h-4 text-accent" />
        </div>
        <div>
          <p className="mono-text text-sm font-medium text-foreground">
            {isConnected ? upload.toFixed(1) : "00.0"} <span className="text-muted-foreground text-xs">mb/s</span>
          </p>
          <p className="text-[10px] text-muted-foreground">Upload</p>
        </div>
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <ArrowDown className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="mono-text text-sm font-medium text-foreground">
            {isConnected ? download.toFixed(1) : "00.0"} <span className="text-muted-foreground text-xs">mb/s</span>
          </p>
          <p className="text-[10px] text-muted-foreground">Download</p>
        </div>
      </div>
    </motion.div>
  );
}
