import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();

  // Check for recovery token in URL
  const hash = window.location.hash;
  const isRecovery = hash.includes("type=recovery");

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Недействительная ссылка</p>
          <button onClick={() => navigate("/")} className="text-primary mt-4 text-sm font-medium">На главную</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Новый пароль</h1>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const pw = (form.elements.namedItem("password") as HTMLInputElement).value;
            if (pw.length < 6) return;
            const { supabase } = await import("@/integrations/supabase/client");
            const { error } = await supabase.auth.updateUser({ password: pw });
            if (!error) navigate("/");
          }}
        >
          <input
            name="password"
            type="password"
            placeholder="Новый пароль (мин. 6 символов)"
            required
            minLength={6}
            className="w-full card-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button type="submit" className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm">
            Обновить пароль
          </button>
        </form>
      </div>
    </div>
  );
}
