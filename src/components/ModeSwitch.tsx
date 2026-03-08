import { motion } from "framer-motion";

interface ModeSwitchProps {
  mode: "auto" | "manual";
  onModeChange: (mode: "auto" | "manual") => void;
}

export default function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="relative flex rounded-xl bg-secondary p-1 w-full max-w-[260px] mx-auto">
      <motion.div
        className="absolute top-1 bottom-1 rounded-lg bg-primary"
        initial={false}
        animate={{ left: mode === "auto" ? "4px" : "50%", width: "calc(50% - 4px)" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      <button
        className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
          mode === "auto" ? "text-primary-foreground" : "text-muted-foreground"
        }`}
        onClick={() => onModeChange("auto")}
      >
        Автопилот
      </button>
      <button
        className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
          mode === "manual" ? "text-primary-foreground" : "text-muted-foreground"
        }`}
        onClick={() => onModeChange("manual")}
      >
        Ручной
      </button>
    </div>
  );
}
