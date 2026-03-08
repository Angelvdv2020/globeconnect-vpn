import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  User, CreditCard, Key, Smartphone, Download, LogOut,
  ArrowLeft, Clock, Shield, Plus, Trash2, RefreshCw, Copy
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Subscription = Tables<"subscriptions">;
type VpnKey = Tables<"vpn_keys">;
type Device = Tables<"user_devices">;

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subStatus, setSubStatus] = useState<any>(null);
  const [keys, setKeys] = useState<VpnKey[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "keys" | "devices">("overview");
  const [importKey, setImportKey] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [canDownloadApk, setCanDownloadApk] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    const [profileRes, subRes, keysRes, devicesRes, subStatusRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("subscriptions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("vpn_keys").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("user_devices").select("*").eq("user_id", user!.id).order("last_seen_at", { ascending: false }),
      supabase.rpc("get_subscription_status"),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (subRes.data) setSubscription(subRes.data);
    if (keysRes.data) setKeys(keysRes.data);
    if (devicesRes.data) setDevices(devicesRes.data);
    if (subStatusRes.data) {
      setSubStatus(subStatusRes.data);
      setCanDownloadApk((subStatusRes.data as any)?.active === true);
    }
  };

  const daysLeft = subStatus?.days_left ?? 0;
  const isActive = subStatus?.active === true;

  const handleImportKey = async () => {
    if (!importKey.trim()) return;
    if (!isActive) {
      toast.error("Требуется активная подписка для импорта ключей");
      return;
    }
    const keyType = importKey.startsWith("vless://") ? "vless" : "subscription";
    const { data, error } = await supabase.rpc("import_vpn_key", {
      _key_value: importKey.trim(),
      _key_type: keyType,
      _label: keyType === "vless" ? "VLESS ключ" : "Subscription URL",
    });
    if (error) {
      toast.error("Ошибка импорта: " + error.message);
    } else if (data && typeof data === "object" && "error" in (data as any)) {
      toast.error((data as any).message || "Ошибка импорта");
    } else {
      toast.success("Ключ импортирован!");
      setImportKey("");
      setShowImport(false);
      loadData();
    }
  };

  const handleDeleteKey = async (id: string) => {
    await supabase.from("vpn_keys").delete().eq("id", id);
    toast.success("Ключ удалён");
    loadData();
  };

  const handleDeleteDevice = async (id: string) => {
    await supabase.from("user_devices").delete().eq("id", id);
    toast.success("Устройство удалено");
    loadData();
  };

  const handleResetDevices = async () => {
    await supabase.rpc("reset_user_devices");
    toast.success("Все устройства сброшены");
    loadData();
  };

  const handleCopyKey = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Ключ скопирован");
  };

  const handleDownloadApk = () => {
    if (!canDownloadApk) {
      toast.error("Для скачивания APK требуется активная подписка");
      return;
    }
    toast.info("APK будет доступен для скачивания на сайте");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const tabs = [
    { id: "overview" as const, label: "Обзор", icon: User },
    { id: "keys" as const, label: "Ключи", icon: Key },
    { id: "devices" as const, label: "Устройства", icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
        <button onClick={() => navigate("/")} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Личный кабинет</h2>
          <p className="text-xs text-muted-foreground">{profile?.email}</p>
        </div>
        <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <LogOut className="w-5 h-5 text-destructive" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isTabActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isTabActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-6 space-y-3">
        {activeTab === "overview" && (
          <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Balance */}
            <div className="card-surface p-4">
              <p className="text-xs text-muted-foreground mb-1">Баланс</p>
              <p className="text-2xl font-bold text-foreground">{profile?.balance ?? 0} ₽</p>
            </div>

            {/* Subscription */}
            <div className="card-surface p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Подписка</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  isActive
                    ? "bg-accent/15 text-accent"
                    : "bg-destructive/15 text-destructive"
                }`}>
                  {isActive ? "Активна" : "Неактивна"}
                </span>
              </div>
              <p className="text-lg font-bold text-foreground capitalize">{subStatus?.plan || "Нет"}</p>
              {isActive && daysLeft > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Осталось {daysLeft} дн.</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                className="card-surface p-4 flex flex-col items-center gap-2"
                onClick={() => toast.info("Покупка подписки — скоро!")}
              >
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium text-foreground">Купить подписку</span>
              </button>

              <button
                className="card-surface p-4 flex flex-col items-center gap-2"
                onClick={() => {
                  if (!isActive) {
                    toast.error("Требуется активная подписка");
                    return;
                  }
                  setActiveTab("keys");
                  setShowImport(true);
                }}
              >
                <Key className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium text-foreground">Импорт ключа</span>
              </button>

              <button
                className="card-surface p-4 flex flex-col items-center gap-2"
                onClick={handleDownloadApk}
              >
                <Download className={`w-5 h-5 ${canDownloadApk ? "text-accent" : "text-muted-foreground"}`} />
                <span className="text-xs font-medium text-foreground">Скачать APK</span>
              </button>

              <button
                className="card-surface p-4 flex flex-col items-center gap-2"
                onClick={() => setActiveTab("devices")}
              >
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  Устройства ({devices.length}/{profile?.max_devices ?? 3})
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === "keys" && (
          <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">VPN Ключи</p>
              <button
                className="flex items-center gap-1 text-xs text-primary font-medium"
                onClick={() => {
                  if (!isActive) {
                    toast.error("Требуется активная подписка");
                    return;
                  }
                  setShowImport(!showImport);
                }}
              >
                <Plus className="w-4 h-4" />
                Импорт
              </button>
            </div>

            {showImport && (
              <motion.div className="card-surface p-4 space-y-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-xs text-muted-foreground">Вставьте vless:// или subscription URL</p>
                <textarea
                  value={importKey}
                  onChange={(e) => setImportKey(e.target.value)}
                  placeholder="vless://... или https://..."
                  className="w-full bg-secondary rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none h-20 mono-text"
                />
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-sm"
                    onClick={handleImportKey}
                  >
                    Импортировать
                  </button>
                  <button
                    className="py-2 px-4 rounded-xl bg-secondary text-muted-foreground text-sm"
                    onClick={() => { setShowImport(false); setImportKey(""); }}
                  >
                    Отмена
                  </button>
                </div>
              </motion.div>
            )}

            {keys.length === 0 ? (
              <div className="card-surface p-8 flex flex-col items-center gap-3">
                <Shield className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">Нет импортированных ключей</p>
              </div>
            ) : (
              keys.map((key) => (
                <div key={key.id} className="card-surface p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{key.label || key.key_type}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      key.is_active ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                    }`}>
                      {key.is_active ? "Активен" : "Неактивен"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mono-text truncate mb-3">{key.key_value}</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleCopyKey(key.key_value)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <Copy className="w-3 h-3" /> Копировать
                    </button>
                    <button onClick={() => handleDeleteKey(key.id)} className="flex items-center gap-1 text-xs text-destructive">
                      <Trash2 className="w-3 h-3" /> Удалить
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === "devices" && (
          <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Устройства ({devices.length}/{profile?.max_devices ?? 3})
              </p>
              {devices.length > 0 && (
                <button
                  className="flex items-center gap-1 text-xs text-destructive font-medium"
                  onClick={handleResetDevices}
                >
                  <RefreshCw className="w-3 h-3" />
                  Сбросить все
                </button>
              )}
            </div>

            {devices.length === 0 ? (
              <div className="card-surface p-8 flex flex-col items-center gap-3">
                <Smartphone className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">Нет подключённых устройств</p>
              </div>
            ) : (
              devices.map((device) => (
                <div key={device.id} className="card-surface p-4 flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {device.device_model || "Устройство"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {device.device_os} {device.os_version}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteDevice(device.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
