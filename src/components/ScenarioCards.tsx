import { motion } from "framer-motion";
import { Globe, Youtube, MessageSquare, HardDrive } from "lucide-react";

const scenarios = [
  { id: "web", label: "Веб", icon: Globe },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "chatgpt", label: "ChatGPT", icon: MessageSquare },
  { id: "torrent", label: "Торренты", icon: HardDrive },
];

interface ScenarioCardsProps {
  active: string;
  onSelect: (id: string) => void;
}

export default function ScenarioCards({ active, onSelect }: ScenarioCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {scenarios.map((s, i) => {
        const Icon = s.icon;
        const isActive = active === s.id;
        return (
          <motion.button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`glass-card flex flex-col items-center gap-1.5 py-3 px-2 transition-all ${
              isActive ? "border-primary/60 glow-primary" : ""
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-[11px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
              {s.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
