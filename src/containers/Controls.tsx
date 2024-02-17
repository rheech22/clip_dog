import Button from "../components/Button";
import useDebugger from "../hooks/useDebugger";

const Controls = () => {
  const { isDebugging, start, stop } = useDebugger();

  return (
    <div className="flex gap-3 justify-center">
      <Button onClick={isDebugging ? stop : start}>
        {isDebugging ? "STOP" : "START"}
      </Button>
    </div>
  );
};

export default Controls;
