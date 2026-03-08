import { MapPin, Settings, Shield } from "lucide-react";

interface TopBarProps {
  onOpenServers: () => void;
  onOpenSettings: () => void;
}

export default function TopBar({ onOpenServers, onOpenSettings }: TopBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button
        onClick={onOpenServers}
        className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-secondary/80"
      >
        <MapPin className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <span className="text-lg font-bold tracking-tight text-foreground">NeonVPN</span>
      </div>

      <button
        onClick={onOpenSettings}
        className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-secondary/80"
      >
        <Settings className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
