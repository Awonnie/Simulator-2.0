"use client";

import Image from 'next/image';
import { useEffect, useState } from "react";
import PresetLoader from "./PresetLoader";
import Button from "./components/Button";
import Home from "./page";

const saveConfig = () => {
  let obs = obstacles;
  let newConfigs = { ...configurations };
  let itExists = false;

  if (newConfigs !== null) {
    newConfigs[configName] = obstacles;
    setConfigurations(newConfigs);
    return;
  }

  //Check with the current configuration via id and see if it exists
  for (const name in configurations) {
    if (configurations[name].length != obs.length) continue;
    let config = configurations[name];
    itExists = true;

    //Before comparing their ids, we standardise by sorting them
    config.sort((a, b) => a.id - b.id);
    obs.sort((a, b) => a.id - b.id);
    for (let i = 0; i < config.length; i++) {
      //If any of the ids dont match, we can skip to the next configuration
      if (config[i].id != obs[i].id) {
        itExists = false;
        break;
      }
    }

    if (itExists) {
      if (name === configName) {
        return;
      } //If it exists and the name is the same, you dont need to save, can just return

      //If it exists and the name is different, you need to update the name
      delete newConfigs[name];
      break;
    }
  }

  newConfigs[configName] = obstacles;
  setConfigurations(newConfigs);
};

const DirectionToString = {
  0: "Up",
  2: "Right",
  4: "Down",
  6: "Left",
  8: "None",
};

const NavBarDrawer = () => {
  const [obstacles, setObstacles] = useState([]);
  const [configName, setConfigName] = useState("");
  const [configurations, setConfigurations] = useState(null);

  useEffect(() => {
    let configList = JSON.parse(localStorage.getItem("Obstacle Presets"));
    if (configList !== null) {
      setConfigurations(configList);
    }
  }, []);

  useEffect(() => {
    if (configurations !== null) {
      localStorage.setItem("Obstacle Presets", JSON.stringify(configurations));
    }
  }, [obstacles, configurations]);

  return (
    <div className="drawer h-screen bg-red-950 text-white">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-black flex flex-col">
        {/* Navbar */}
        <div className="sticky bg-red-950 top-0 z-50 w-full navbar border-2 border-theme-gold">
          <div className="flex navbar-start bg-red-950 max-w-16">
            <label
              htmlFor="my-drawer-3"
              aria-label="open sidebar"
              className="cursor-pointer bg-theme-gold p-2 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
          </div>
          <div className="flex navbar-center bg-red-950 w-full justify-center">
          <div className="custom-shape h-12 w-12 relative">
            <Image
              src={`/images/gold-medal.png`}
              alt="Gold Medal"
              layout="fill"
              objectFit="contain"
            />
          </div>
            <span className="font-bold text-xl from-theme-gold to-theme-dark-red bg-clip-text bg-red-950">
                Group 7 Algorithm Training Centre
            </span>
            <div className="custom-shape h-12 w-12 relative">
              <Image
                src={`/images/gold-medal.png`}
                alt="Gold Medal"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
        </div>
        {/* Page Content */}
        <Home obstacles={obstacles} setObstacles={setObstacles} />
      </div>
      <div className="absolute top-[64px] drawer-side">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="p-4 w-80 min-h-full bg-black border-r-4 border-theme-gold">
          {/* Sidebar content here */}
          <li>
            {/* Obstacle List View */}
            {obstacles.length > 0 && (
              <div className="flex justify-center bg-gray-800 rounded-xl border-2 border-theme-gold mb-8 p-4 w-full">
                <div className="card-body items-center text-center p-4">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-theme-gold to-theme-dark-red text-transparent bg-clip-text">
                    Current Obstacles
                  </h2>
                  <div className="grid grid-cols-5 gap-5 p-5">
                    {obstacles.map((ob) => {
                      return (
                        <div
                          key={ob}
                          className="flex justify-evenly items-center bg-white rounded-lg shadow-md p-3 border border-red-300 text-red-800 cursor-pointer hover:-translate-y-2 hover:scale-105 hover:bg-red-800 hover:text-white transition duration-150 ease-in-out"
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData("ObInfo", JSON.stringify(ob))
                          }
                        >
                          <div className="flex flex-col">
                            <div className="font-semibold">
                              (x:{ob.x} , y:{ob.y})
                            </div>
                            <div className="font-semibold">
                              D: {DirectionToString[ob.d]}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="container flex justify-evenly">
                    <div className="w-1/2 h-100% bg-gray-900 rounded-md p-1">
                      <input
                        type="text"
                        className="w-full h-full rounded-md text-center text-gray-900 hover:shadow-inner focus:outline-none"
                        value={configName}
                        placeholder={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                      />
                    </div>

                    <Button style={"gradient-btn-purple"} onClick={saveConfig}>
                      Save Configuration
                    </Button>

                    <Button style={"outline-btn-red"}>Delete</Button>
                  </div>
                </div>
              </div>
            )}
          </li>
          <li>
            {/* Configurations Loader */}
            <PresetLoader
              setConfigName={setConfigName}
              setObstacles={setObstacles}
              configurations={configurations}
              setConfigurations={setConfigurations}
            />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavBarDrawer;
