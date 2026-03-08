import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Globe, MessageCircle, Download, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const menuItems = [
    ...(user
      ? [{ icon: User, label: "Личный кабинет", action: () => { onClose(); navigate("/dashboard"); } }]
      : [{ icon: User, label: "Войти", action: () => { onClose(); navigate("/auth"); } }]
    ),
    { icon: Globe, label: "Сайт", action: () => {} },
    { icon: MessageCircle, label: "Поддержка Telegram", action: () => {} },
    { icon: Download, label: "Скачать приложение", action: () => {} },
    ...(user ? [{ icon: LogOut, label: "Выход", action: async () => { await signOut(); onClose(); }, destructive: true as const }] : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground">Настройки</h2>
          </div>

          <div className="flex-1 px-4 py-4 space-y-2">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              const isDestructive = "destructive" in item && item.destructive;
              return (
                <motion.button
                  key={item.label}
                  onClick={item.action}
                  className={`card-surface w-full flex items-center gap-3 p-4 text-left ${
                    isDestructive ? "border-destructive/30" : ""
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Icon className={`w-5 h-5 ${isDestructive ? "text-destructive" : "text-muted-foreground"}`} />
                  <span className={`font-medium text-sm ${isDestructive ? "text-destructive" : "text-foreground"}`}>
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
