import { useEffect, useState } from "react";
import Button from "../components/Button";
import { getCurrentTab, sendMessage } from "../chrome";
import { Method, Mode } from "../constants";

const modeToMethod: Record<Mode, Method> = {
  [Mode.Idle]: Method.End,
  [Mode.Recording]: Method.Start,
};

const modeToString: Record<Mode, string> = {
  [Mode.Idle]: "로그 수집 시작",
  [Mode.Recording]: "로그 수집 종료",
};

const Controls = () => {
  const [mode, setMode] = useState<Mode>(Mode.Idle);

  const handleClick = (to: Mode) => async () => {
    const tab = await getCurrentTab();

    const response = await sendMessage({
      tab,
      method: modeToMethod[to],
    });

    if (response.ok) {
      setMode(to);
    }

    if (response.error) {
      console.error(response.description);
    }
  };

  useEffect(() => {
    (async () => {
      const tab = await getCurrentTab();

      const response = await sendMessage({
        tab,
        method: Method.IsDebuggee,
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
