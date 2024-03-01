import Controls from "./containers/Controls";

const App = () => {
  return (
    <div className="h-full flex flex-col gap-2 items-center bg-zinc-800 p-4">
      <h1 className="text-lime-500 font-mono text-xl font-blod">Netracer</h1>
      <Controls />
    </div>
  );
};

export default App;
