"use client";

import { useState, useEffect } from "react";

export default function Configurations({
  setConfigName,
  setObs,
  haveConfig,
  configs,
  setConfigs,
}) {
  let configList = JSON.parse(localStorage.getItem("Configurations"));
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (configList) {
      setConfigs(configList);
      haveConfig.current = true;
    }
  }, []);

  useEffect(() => {
    if (haveConfig.current) {
      configList = configs;
      setCounter(counter + 1);
    }
  }, [configs]);

  const loadConfig = (name, ob) => {
    setObs(ob);
    setConfigName(name);
  };

  return (
    <>
      {configList && (
        <div className="bg-white rounded-xl shadow-xl mb-8 p-4 w-full max-w-4xl">
          <div className="card-body items-center text-center p-4">
            <h2 className="mb-5 text-xl font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Configurations
            </h2>
            <div className="container flex-col">
              {Object.entries(configList).map(([key, value]) => (
                <div key={key} className="container flex justify-evenly p-2">
                  <div className="w-1/2 flex items-center border-b-2 border-gray-300">
                    <p className="font-bold text-black text-center">{key}</p>
                  </div>
                  <button
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded shadow-lg hover:scale-105 active:scale-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    onClick={() => loadConfig(key, value)}
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
