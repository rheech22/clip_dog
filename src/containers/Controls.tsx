import { useEffect, useState } from "react";
import Button from "../components/Button";
import { createPort, getCurrentTab } from "../ex";

enum Mode {
  Idle = "Idle",
  Recording = "Recording",
}

const modeToMethod: Record<Mode, "START" | "END"> = {
  [Mode.Idle]: "START",
  [Mode.Recording]: "END",
};

const Controls = () => {
  const [mode, setMode] = useState<Mode>(Mode.Idle);
  const port = createPort("Netracer");

  const handleClick = async (mode: Mode) => {
    setMode(mode);

    await chrome.storage.session.set({ mode });

    const tab = await getCurrentTab();

    port.postMessage({ tab, method: modeToMethod[mode] });
  };

  useEffect(() => {
    chrome.storage.session.get(["mode"]).then((result) => {
      setMode(result.mode ?? Mode.Idle);
    });
  }, []);

  return (
    <div>
      <Button
        onClick={() =>
          handleClick(mode === Mode.Idle ? Mode.Recording : Mode.Idle)
        }
      >
        {mode === Mode.Idle ? "로그 수집 시작" : "수집 종료"}
      </Button>
    </div>
  );
};

export default Controls;
