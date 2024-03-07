import { useState, useEffect } from "react";
import Button from "./components/Button";

export default function PresetLoader({
  setConfigName,
  setObs,
  haveConfig,
  configs,
  setConfigs,
}) {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    let configList = JSON.parse(localStorage.getItem("Maze Presets"));
    setConfigs(configList);
    haveConfig.current = true;
  }, []);

  useEffect(() => {
    if (haveConfig.current) {
      setCounter(counter + 1);
    }
  }, [configs]);

  const loadConfig = (name, ob) => {
    setObs(ob);
    setConfigName(name);
  };

  return (
    <>
      {configs && (
        <div className="bg-white rounded-xl shadow-xl mb-8 p-4 w-full max-w-4xl">
          <div className="card-body items-center text-center p-4">
            <h2 className="mb-5 text-xl font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Configurations
            </h2>
            <div className="container flex-col">
              {Object.entries(configs).map(([key, value]) => (
                <div key={key} className="container flex justify-evenly p-2">
                  <div className="w-1/2 flex items-center border-b-2 border-gray-300">
                    <p className="font-bold text-black text-center">{key}</p>
                  </div>
                  <Button
                    style={"gradient-btn-purple"}
                    onClick={() => loadConfig(key, value)}
                  >
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
