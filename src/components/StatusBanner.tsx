import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";

interface StatusBannerProps {
  isLoggedIn: boolean;
  hasSubscription: boolean;
  hasKeys: boolean;
  daysLeft: number;
}

export default function StatusBanner({ isLoggedIn, hasSubscription, hasKeys, daysLeft }: StatusBannerProps) {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => navigate("/auth")}
        className="w-full card-surface border-primary/30 p-3 flex items-center gap-2 text-left"
      >
        <AlertCircle className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs text-foreground font-medium">Войдите в аккаунт для использования VPN</span>
      </button>
    );
  }

  if (!hasSubscription) {
    return (
      <button
        onClick={() => navigate("/dashboard")}
        className="w-full card-surface border-destructive/30 p-3 flex items-center gap-2 text-left"
      >
        <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
        <span className="text-xs text-foreground font-medium">Подписка неактивна. Перейти в ЛК →</span>
      </button>
    );
  }

  if (!hasKeys) {
    return (
      <button
        onClick={() => navigate("/dashboard")}
        className="w-full card-surface border-primary/30 p-3 flex items-center gap-2 text-left"
      >
        <AlertCircle className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs text-foreground font-medium">Импортируйте ключ в Личном кабинете →</span>
      </button>
    );
  }

  return (
    <div className="w-full card-surface border-accent/30 p-3 flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-accent shrink-0" />
      <span className="text-xs text-foreground font-medium">
        Подписка активна · {daysLeft > 0 ? `${daysLeft} дн.` : "∞"}
      </span>
    </div>
  );
}
