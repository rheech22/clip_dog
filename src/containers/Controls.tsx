import { useEffect, useState } from "react";
import Button from "../components/Button";
import {
  createPort,
  getCurrentTab,
  getSessionItem,
  setSessionItem,
} from "../ex";

enum Mode {
  Idle = "Idle",
  Recording = "Recording",
}

const modeToMethod: Record<Mode, "START" | "END"> = {
  [Mode.Idle]: "START",
  [Mode.Recording]: "END",
};

const modeToString: Record<Mode, string> = {
  [Mode.Idle]: "로그 수집 시작",
  [Mode.Recording]: "로그 수집 종료",
};

const Controls = () => {
  const [mode, setMode] = useState<Mode>(Mode.Idle);
  const port = createPort("Netracer");

  const handleClick = (mode: Mode) => async () => {
    setMode(mode);

    await setSessionItem("mode", mode);

    const tab = await getCurrentTab();

    port.postMessage({ tab, method: modeToMethod[mode] });
  };

  useEffect(() => {
    (async () => {
      const mode = await getSessionItem("mode");

      mode && setMode(mode);
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
