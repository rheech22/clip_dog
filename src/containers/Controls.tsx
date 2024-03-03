import { useEffect, useState } from "react";
import Button from "../components/Button";
import { getCurrentTab } from "../ex";

enum Mode {
  Idle = "Idle",
  Recording = "Recording",
}

const modeToMethod: Record<Mode, "START" | "END"> = {
  [Mode.Idle]: "END",
  [Mode.Recording]: "START",
};

const modeToString: Record<Mode, string> = {
  [Mode.Idle]: "로그 수집 시작",
  [Mode.Recording]: "로그 수집 종료",
};

const Controls = () => {
  const [mode, setMode] = useState<Mode>(Mode.Idle);

  const handleClick = (to: Mode) => async () => {
    const tab = await getCurrentTab();

    const result = await chrome.runtime.sendMessage({
      tab,
      method: modeToMethod[to],
    });

    if (result.ok) {
      setMode(to);
    }

    if (result.error) {
      console.error(result.description);
    }
  };

  useEffect(() => {
    (async () => {
      const tab = await getCurrentTab();

      const response = await chrome.runtime.sendMessage({
        tab,
        method: "IS_DEBUGGEE",
      });

      if (response.ok) {
        const mode = response?.result ? Mode.Recording : Mode.Idle;

        setMode(mode);
      }

      if (response.error) {
        console.error(response.description);
      }
    })();
  }, []);

  return (
    <div>
      <Button
        onClick={handleClick(mode === Mode.Idle ? Mode.Recording : Mode.Idle)}
      >
        {modeToString[mode]}
      </Button>
    </div>
  );
};

export default Controls;
