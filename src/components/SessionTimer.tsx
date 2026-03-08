import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface SessionTimerProps {
  startTime: Date;
}

export default function SessionTimer({ startTime }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      setElapsed(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Clock className="w-4 h-4" />
      <span className="mono-text text-sm font-medium">{elapsed}</span>
    </div>
  );
}
