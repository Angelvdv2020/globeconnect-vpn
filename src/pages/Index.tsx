import { useState, useEffect } from "react";
import Onboarding from "./Onboarding";
import Home from "./Home";

const Index = () => {
  const [onboarded, setOnboarded] = useState(() => {
    return localStorage.getItem("vpn_onboarded") === "true";
  });

  const handleComplete = () => {
    localStorage.setItem("vpn_onboarded", "true");
    setOnboarded(true);
  };

  if (!onboarded) {
    return <Onboarding onComplete={handleComplete} />;
  }

  return <Home />;
};

export default Index;
