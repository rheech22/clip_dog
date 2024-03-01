import { useEffect, useState } from "react";
import { createPort, getCurrentTab } from "../ex";

// TODO: 탭 on/off와 상관없이
const useDebugger = () => {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const port = createPort("Netracer");

  const start = async () => {
    port.postMessage({ tab: currentTab, method: "START" });
    setIsDebugging(true);
  };

  const stop = async () => {
    port.postMessage({ tab: currentTab, method: "END" });
    setIsDebugging(false);
  };

  useEffect(() => {
    (async () => {
      const tab = await getCurrentTab();
      setCurrentTab(tab);
    })();

    return () => {
      setCurrentTab(null);
      setIsDebugging(false);
    };
  }, []);

  return {
    start,
    stop,
    isDebugging,
  };
};

export default useDebugger;
