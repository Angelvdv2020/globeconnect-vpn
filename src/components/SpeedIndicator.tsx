import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

interface SpeedIndicatorProps {
  isConnected: boolean;
  upload: number;
  download: number;
}

export default function SpeedIndicator({ isConnected, upload, download }: SpeedIndicatorProps) {
  return (
    <div className="card-surface flex items-center justify-center gap-6 sm:gap-8 px-6 sm:px-8 py-3 sm:py-4 w-full">
      <div className="flex items-center gap-2">
        <ArrowUp className="w-4 h-4 text-accent" />
        <div>
          <p className="mono-text text-sm font-medium text-foreground">
            {isConnected ? upload.toFixed(1) : "0.0"} <span className="text-muted-foreground text-xs">mb/s</span>
          </p>
          <p className="text-[10px] text-muted-foreground">Upload</p>
        </div>
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="flex items-center gap-2">
        <ArrowDown className="w-4 h-4 text-primary" />
        <div>
          <p className="mono-text text-sm font-medium text-foreground">
            {isConnected ? download.toFixed(1) : "0.0"} <span className="text-muted-foreground text-xs">mb/s</span>
          </p>
          <p className="text-[10px] text-muted-foreground">Download</p>
        </div>
      </div>
    </div>
  );
}
