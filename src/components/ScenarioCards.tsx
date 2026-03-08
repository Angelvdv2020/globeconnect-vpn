import { Globe, Youtube, MessageSquare, HardDrive } from "lucide-react";

const scenarios = [
  { id: "web", label: "Веб", icon: Globe },
  { id: "video", label: "Видео", icon: Youtube },
  { id: "ai", label: "AI", icon: MessageSquare },
  { id: "p2p", label: "P2P", icon: HardDrive },
];

interface ScenarioCardsProps {
  active: string;
  onSelect: (id: string) => void;
}

export default function ScenarioCards({ active, onSelect }: ScenarioCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {scenarios.map((s) => {
        const Icon = s.icon;
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`card-surface flex flex-col items-center gap-1.5 py-3 px-2 transition-all ${
              isActive ? "border-primary ring-1 ring-primary/20" : ""
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-[11px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
