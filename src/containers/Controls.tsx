import Button from "../components/Button";
import { createPort, getCurrentTab } from "../ex";

const Controls = () => {
  const port = createPort("Netracer");

  const handleClickStart = async () => {
    const tab = await getCurrentTab();

    port.postMessage({ tab, method: "START" });
  };

  const handleClickEnd = async () => {
    const tab = await getCurrentTab();

    port.postMessage({ tab, method: "END" });
  };

  return (
    <div>
      <Button onClick={handleClickStart}>start</Button>
      <Button onClick={handleClickEnd}>end</Button>
    </div>
  );
};

export default Controls;
