interface ModeSwitchProps {
  mode: "auto" | "manual";
  onModeChange: (mode: "auto" | "manual") => void;
}

export default function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="flex rounded-xl bg-secondary p-1 w-full max-w-[280px] mx-auto">
      <button
        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
          mode === "auto" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
        }`}
        onClick={() => onModeChange("auto")}
      >
        Автопилот
      </button>
      <button
        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
          mode === "manual" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
        }`}
        onClick={() => onModeChange("manual")}
      >
        Ручной
      </button>
    </div>
  );
}
