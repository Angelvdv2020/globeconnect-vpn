import { motion } from "framer-motion";
import { Shield, ChevronRight } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-background">
      <motion.div
        className="flex flex-col items-center gap-6 max-w-sm text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo glow */}
        <motion.div
          className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center relative"
          animate={{ boxShadow: ["0 0 30px hsl(32 100% 50% / 0.2)", "0 0 50px hsl(32 100% 50% / 0.4)", "0 0 30px hsl(32 100% 50% / 0.2)"] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Shield className="w-12 h-12 text-primary" />
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">NeonVPN</h1>
          <p className="text-muted-foreground leading-relaxed">
            Безопасный и быстрый VPN. Защитите ваш интернет одним нажатием.
          </p>
        </div>

        <motion.button
          onClick={onComplete}
          className="mt-4 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg flex items-center justify-center gap-2 glow-primary"
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
        >
          Начать
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
