import { motion } from "framer-motion";
import { ShoppingCart, Key, RefreshCw, FileInput } from "lucide-react";

interface SubscriptionButtonsProps {
  hasSubscription: boolean;
}

export default function SubscriptionButtons({ hasSubscription }: SubscriptionButtonsProps) {
  if (!hasSubscription) {
    return (
      <motion.button
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 glow-primary"
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ShoppingCart className="w-5 h-5" />
        Купить подписку
      </motion.button>
    );
  }

  const actions = [
    { icon: Key, label: "Получить новый ключ" },
    { icon: RefreshCw, label: "Обновить данные" },
    { icon: FileInput, label: "Импортировать вручную" },
  ];

  return (
    <div className="flex gap-2">
      {actions.map((a, i) => {
        const Icon = a.icon;
        return (
          <motion.button
            key={a.label}
            className="flex-1 glass-card py-2.5 px-2 flex flex-col items-center gap-1.5"
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Icon className="w-4 h-4 text-accent" />
            <span className="text-[10px] text-center leading-tight text-muted-foreground font-medium">{a.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
