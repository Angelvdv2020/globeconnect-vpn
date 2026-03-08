import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Signal } from "lucide-react";

interface Server {
  id: string;
  address: string;
  port: number;
  label: string;
  protocol: string;
}

interface ServerListProps {
  isOpen: boolean;
  servers: Server[];
  selectedServer: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function ServerList({ isOpen, servers, selectedServer, onSelect, onClose }: ServerListProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col max-w-md mx-auto"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground">Серверы</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {servers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Signal className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  Нет доступных серверов.<br />Импортируйте ключ в Личном кабинете.
                </p>
              </div>
            ) : (
              servers.map((server, i) => {
                const isSelected = selectedServer === server.id;
                return (
                  <motion.button
                    key={server.id}
                    onClick={() => { onSelect(server.id); onClose(); }}
                    className={`card-surface w-full flex items-center gap-3 p-4 transition-all ${
                      isSelected ? "border-primary ring-1 ring-primary/20" : ""
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Signal className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground text-sm">{server.label}</p>
                      <p className="text-xs text-muted-foreground">{server.address}:{server.port} · {server.protocol}</p>
                    </div>
                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full border border-border" />
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
