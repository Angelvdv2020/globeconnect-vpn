import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Signal } from "lucide-react";

interface Server {
  id: string;
  country: string;
  flag: string;
  ping: number;
  load: number;
}

const servers: Server[] = [
  { id: "nl", country: "Netherlands", flag: "🇳🇱", ping: 24, load: 45 },
  { id: "fi", country: "Finland", flag: "🇫🇮", ping: 38, load: 30 },
  { id: "ch", country: "Switzerland", flag: "🇨🇭", ping: 31, load: 55 },
  { id: "de", country: "Germany", flag: "🇩🇪", ping: 19, load: 62 },
  { id: "us", country: "USA", flag: "🇺🇸", ping: 89, load: 40 },
];

interface ServerListProps {
  isOpen: boolean;
  selectedServer: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function ServerList({ isOpen, selectedServer, onSelect, onClose }: ServerListProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground">Выбор сервера</h2>
          </div>

          {/* Server list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {servers.map((server, i) => {
              const isSelected = selectedServer === server.id;
              return (
                <motion.button
                  key={server.id}
                  onClick={() => {
                    onSelect(server.id);
                    onClose();
                  }}
                  className={`glass-card w-full flex items-center gap-3 p-4 transition-all ${
                    isSelected ? "border-accent/50 glow-accent" : ""
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">{server.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{server.country}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Signal className="w-3 h-3" /> {server.ping}ms
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Нагрузка: {server.load}%
                      </span>
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent-foreground" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-border" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
