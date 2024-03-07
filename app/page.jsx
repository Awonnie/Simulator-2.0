"use client";

import { useEffect, useRef, useState } from "react";
import PresetLoader from "./PresetLoader";
import { QueryAPI } from "../helpers";
import Button from "./Button";

const Direction = {
  NORTH: 0,
  EAST: 2,
  SOUTH: 4,
  WEST: 6,
  SKIP: 8,
};

const ObDirection = {
  NORTH: 0,
  EAST: 2,
  SOUTH: 4,
  WEST: 6,
  SKIP: 8,
};

const DirectionToString = {
  0: "Up",
  2: "Right",
  4: "Down",
  6: "Left",
  8: "None",
};

const hashString = (str) => {
  let hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
};
// Function to format the timer value into HH:mm:ss format
const formatTimer = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
};
const onDelete = (e) => {
  e.preventDefault();
  e.target.classList.remove("text-red-500");
  e.target.classList.add("text-white", "bg-red-500", "scale-125");
};

const offDelete = (e) => {
  e.target.classList.remove("text-white", "bg-red-500", "scale-125");
  e.target.classList.add("text-red-500");
};
// Function to pad a number with leading zeros if it's less than 10
const padZero = (num) => (num < 10 ? `0${num}` : num);
const transformCoord = (x, y) => {
  // Change the coordinate system from (0, 0) at top left to (0, 0) at bottom left
  return { x: 19 - y, y: x };
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  function interpolatePath(path) {
    let interpolatedPath = [];

    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];
      interpolatedPath.push(start);

      // Calculate differences
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const maxSteps = Math.max(Math.abs(dx), Math.abs(dy));

      // Calculate step increments
      const stepX = dx / maxSteps;
      const stepY = dy / maxSteps;

      // Generate intermediate steps
      for (let step = 1; step <= maxSteps; step++) {
        interpolatedPath.push({
          d: start.d, // Assume direction doesn't change, adjust as necessary
          s: start.s,
          x: start.x + stepX * step,
          y: start.y + stepY * step,
        });
      }
    }

    // Ensure the final position is included
    interpolatedPath.push(path[path.length - 1]);

    return interpolatedPath;
  }

  const generateNewID = () => {
    while (true) {
      let new_id = Math.floor(Math.random() * 10) + 1; // just try to generate an id;
      let ok = true;
      for (const ob of obstacles) {
        if (ob.id === new_id) {
          ok = false;
          break;
        }
      }
      if (ok) {
        return new_id;
      }
    }
  };

  const generateRobotCells = () => {
    const robotCells = [];
    let markerX = 0;
    let markerY = 0;

    if (Number(robotState.d) === Direction.NORTH) {
      markerY++;
    } else if (Number(robotState.d) === Direction.EAST) {
      markerX++;
    } else if (Number(robotState.d) === Direction.SOUTH) {
      markerY--;
    } else if (Number(robotState.d) === Direction.WEST) {
      markerX--;
    }

    // Go from i = -1 to i = 1
    for (let i = -1; i < 2; i++) {
      // Go from j = -1 to j = 1
      for (let j = -1; j < 2; j++) {
        // Transform the coordinates to our coordinate system where (0, 0) is at the bottom left
        const coord = transformCoord(robotState.x + i, robotState.y + j);
        // If the cell is the marker cell, add the robot state to the cell
        if (markerX === i && markerY === j) {
          robotCells.push({
            x: coord.x,
            y: coord.y,
            d: robotState.d,
            s: robotState.s,
          });
        } else {
          robotCells.push({
            x: coord.x,
            y: coord.y,
            d: null,
            s: -1,
          });
        }
      }
    }

    return robotCells;
  };

  const onChangeRobotX = (event) => {
    // If the input is an integer and is in the range [1, 18], set RobotX to the input
    if (Number.isInteger(Number(event.target.value))) {
      const nb = Number(event.target.value);
      if (1 <= nb && nb < 19) {
        setRobotX(nb);
        return;
      }
    }
    // If the input is not an integer or is not in the range [1, 18], set the input to 1
    setRobotX(1);
  };

  const onChangeRobotY = (event) => {
    // If the input is an integer and is in the range [1, 18], set RobotY to the input
    if (Number.isInteger(Number(event.target.value))) {
      const nb = Number(event.target.value);
      if (1 <= nb && nb < 19) {
        setRobotY(nb);
        return;
      }
    }
    // If the input is not an integer or is not in the range [1, 18], set the input to 1
    setRobotY(1);
  };

  const saveConfig = () => {
    let obs = obstacles;
    let newConfigs = { ...configurations };
    let itExists = false;

    //If config is empty
    if (!haveConfig.current) {
      newConfigs[configName] = obstacles;
      haveConfig.current = true;
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

  const onClickObstacle = (obInput) => {
    const { x, y, d } = obInput;
    const id = hashString(`${x}-${y}-${d}`);
    //Check if obstacle already exists using id
    for (const ob in obstacles) {
      if (ob.id === id) return;
    }

    //Update to obstacle list
    const currentObstacle = { ...obInput, id: id };
    const newObstacles = [...obstacles];
    newObstacles.push(currentObstacle);
    setObstacles(newObstacles);
  };

  const changeOrientation = (obInput) => {
    let newObstacles = obstacles.map((ob) => {
      if (ob.id === obInput.id) {
        const newDir = (ob.d + 2) % 8;
        return {
          ...ob,
          d: newDir,
          id: hashString(`${ob.x}-${ob.y}-${newDir}`),
        };
      }
      return ob;
    });
    setObstacles(newObstacles);
  };

  const onClickRobot = () => {
    // Set the robot state to the input

    setRobotState({ x: robotX, y: robotY, d: robotDir, s: -1 });
  };

  const onRobotDirectionInputChange = (event) => {
    // Set the robot direction to the input
    setRobotDir(event.target.value);
  };

  const deleteObInfo = (e) => {
    offDelete(e);
    // If the path is not empty or the algorithm is computing, return
    if (path.length > 0 || isComputing) return;

    const ob = JSON.parse(e.dataTransfer.getData("obInfo"));
    // Filter out the target obstacle
    const newObstacles = obstacles.filter((o) => o.id !== ob.id);
    // Set the obstacles to the new array
    setObstacles(newObstacles);
  };

  const compute = () => {
    // Set computing to true, act like a lock
    setIsComputing(true);
    // Call the query function from the API
    QueryAPI.query(obstacles, robotX, robotY, robotDir, (data, err) => {
      if (data) {
        // If the data is valid, set the path
        setPath(data.data.path);

        // Path duration contains a list of the duration of each step
        setPathDuration(data.data.path_execution_time);

        // Total Duration of the entire path
        setDuration(data.data.duration);
        setDistance(data.data.distance); // Update this line to set the distance

        // Set the commands
        const commands = [];
        for (let x of data.data.commands) {
          // If the command is a snapshot, skip it
          if (x.startsWith("SNAP")) {
            continue;
          }
          commands.push(x);
        }
        setCommands(commands);
      }
      // Set computing to false, release the lock
      setIsComputing(false);
    });
  };

  const onResetAll = () => {
    // Reset all the states
    setRobotX(1);
    setRobotDir(0);
    setRobotY(1);
    setRobotState({ x: 1, y: 1, d: Direction.NORTH, s: -1 });
    setPath([]);
    setCommands([]);
    setPage(0);
    setObstacles([]);
  };

  const onReset = () => {
    // Reset all the states
    setRobotX(1);
    setRobotDir(0);
    setRobotY(1);
    setRobotState({ x: 1, y: 1, d: Direction.NORTH, s: -1 });
    setPath([]);
    setCommands([]);
    setPage(0);
  };

  const dragStart = (e, ob) => {
    e.dataTransfer.setData("draggedOb", JSON.stringify(ob));
  };

  const dragOver = (e) => {
    e.preventDefault();
    e.target.classList.add("bg-gray-600");
  };

  const dragOut = (e) => {
    e.target.classList.remove("bg-gray-600");
  };

  const handleDrop = (e, newOb) => {
    const obToDelete = JSON.parse(e.dataTransfer.getData("draggedOb"));
    const obToAdd = {
      ...newOb,
      d: obToDelete.d,
      id: hashString(`${newOb.x}-${newOb.y}-${obToDelete.d}`),
    };
    let newObstacles = obstacles.filter((ob) => ob.id !== obToDelete.id);
    newObstacles.push(obToAdd);
    setObstacles(newObstacles);
  };

  const renderGrid = () => {
    // Initialize the empty rows array
    const rows = [];

    const baseStyle = {
      width: 25,
      height: 25,
      borderStyle: "solid",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      padding: 0,
    };

    // Generate robot cells
    const robotCells = generateRobotCells();

    // Generate the grid
    for (let i = 0; i < 20; i++) {
      const cells = [
        // Header cells
        <td key={i} className="w-5 h-5 md:w-8 md:h-8">
          <span className="text-sky-900 font-bold text-[0.6rem] md:text-base ">
            {19 - i}
          </span>
        </td>,
      ];

      for (let j = 0; j < 20; j++) {
        let foundOb = null;
        let foundRobotCell = null;
        let foundTraceCell = null;

        for (const ob of obstacles) {
          const transformed = transformCoord(ob.x, ob.y);
          if (transformed.x === i && transformed.y === j) {
            foundOb = ob;
            break;
          }
        }

        for (const trace of pathHistory) {
          const transformed = transformCoord(trace.x, trace.y);
          if (transformed.x === i && transformed.y === j) {
            foundTraceCell = trace;
            break;
          }
        }

        if (!foundOb) {
          for (const cell of robotCells) {
            if (cell.x === i && cell.y === j) {
              foundRobotCell = cell;
              break;
            }
          }
        }

        if (foundOb) {
          if (foundOb.d === Direction.WEST) {
            cells.push(
              <td
                className="border border-l-4 border-l-red-500 w-5 h-5 md:w-8 md:h-8 bg-blue-700 transition duration-150 ease-in-out hover:cursor-pointer hover:bg-green-600 active:bg-red-500 active:scale-90  hover:border-l-red-500 hover:border-l-4"
                onClick={() => changeOrientation(foundOb)}
                draggable
                onDragStart={(e) => dragStart(e, foundOb)}
              />
            );
          } else if (foundOb.d === Direction.EAST) {
            cells.push(
              <td
                className="border border-r-4 border-r-red-500 w-5 h-5 md:w-8 md:h-8 bg-blue-700 transition duration-150 ease-in-out hover:cursor-pointer hover:bg-green-600 active:bg-red-500 active:scale-90  hover:border-r-red-500 hover:border-r-4"
                onClick={() => changeOrientation(foundOb)}
                draggable
                onDragStart={(e) => dragStart(e, foundOb)}
              />
            );
          } else if (foundOb.d === Direction.NORTH) {
            cells.push(
              <td
                className="border border-t-4 border-t-red-500 w-5 h-5 md:w-8 md:h-8 bg-blue-700 transition duration-150 ease-in-out hover:cursor-pointer hover:bg-green-600 active:bg-red-500 active:scale-90 hover:border-t-red-500 hover:border-t-4"
                onClick={() => changeOrientation(foundOb)}
                draggable
                onDragStart={(e) => dragStart(e, foundOb)}
              />
            );
          } else if (foundOb.d === Direction.SOUTH) {
            cells.push(
              <td
                className="border border-b-4 border-b-red-500 w-5 h-5 md:w-8 md:h-8 bg-blue-700 transition duration-150 ease-in-out hover:cursor-pointer hover:bg-green-600 active:bg-red-500 active:scale-90  hover:border-b-red-500 hover:border-b-4"
                onClick={() => changeOrientation(foundOb)}
                draggable
                onDragStart={(e) => dragStart(e, foundOb)}
              />
            );
          } else if (foundOb.d === Direction.SKIP) {
            cells.push(
              <td className="border w-5 h-5 md:w-8 md:h-8 bg-blue-700 transition" />
            );
          }
        } else if (foundRobotCell) {
          if (foundRobotCell.d !== null) {
            cells.push(
              <td
                className={`border w-5 h-5 md:w-8 md:h-8 transition ${
                  foundRobotCell.s != -1 ? "bg-red-500" : "bg-yellow-300"
                }`}
              />
            );
          } else {
            cells.push(
              <td className="bg-green-600 border-white border w-5 h-5 md:w-8 md:h-8 transition" />
            );
          }
        } else if (foundTraceCell && leaveTrace) {
          cells.push(
            <td
              className="border w-5 h-5 md:w-8 md:h-8 bg-blue-500 transition" // Example style for path history cells
            />
          );
        } else {
          const ob = {
            x: j,
            y: 19 - i,
            d: ObDirection.NORTH,
          };
          cells.push(
            <td
              className="border-black border w-5 h-5 md:w-8 md:h-8 hover:bg-blue-700 cursor-pointer transition"
              onClick={() => onClickObstacle(ob)}
              onDragOver={(e) => dragOver(e)}
              onDragLeave={(e) => dragOut(e)}
              onDrop={(e) => handleDrop(e, ob)}
            />
          );
        }
      }

      rows.push(<tr key={19 - i}>{cells}</tr>);
    }

    const yAxis = [<td key={0} />];
    for (let i = 0; i < 20; i++) {
      yAxis.push(
        <td className="w-5 h-5 md:w-8 md:h-8">
          <span className="text-sky-900 font-bold text-[0.6rem] md:text-base ">
            {i}
          </span>
        </td>
      );
    }
    rows.push(<tr key={20}>{yAxis}</tr>);
    return rows;
  };

  // Function to start the timer
  const startTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      setTimer((prevTimer) => prevTimer + 1);

      // Set the timerInterval state with the interval ID
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);

      // Store the interval ID in timerInterval state
      setTimerInterval(intervalId);
    }
  };

  // Function to stop the timer
  const stopTimer = () => {
    if (timerRunning) {
      // Clear the interval using the stored interval ID
      clearInterval(timerInterval);
      setTimerRunning(false);
    }
  };

  // Function to reset the timer
  const resetTimer = () => {
    if (timerInterval) {
      // Clear the interval using the stored interval ID
      clearInterval(timerInterval);
    }
    setTimer(0);
    setTimerRunning(false);
  };

  async function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  const startImmediate = async () => {
    for (let i = 0; i < newpath.length; i++) {
      await sleep(0.02);
      setRobotState(newpath[i]);
      if (traceEnabled) {
        updatePathHistory(path[i]);
        setTraceEnabled(false);
      }
    }
  };

  // Function to start the animation
  const startAnimation = async () => {
    isAnimating.current = true;
    startTimer();
    for (let i = 0; i < path_duration.length; i++) {
      if (!isAnimating.current) {
        setPage(0);
        break;
      }
      await sleep(path_duration[i]);
      setPage(i);
      if (traceEnabled) {
        updatePathHistory(path[i]);
        setTraceEnabled(false);
      }
      if (i + 1 == +path.length) {
        stopTimer();
      }
    }
  };

  // Function to clear the animation
  const clearAnimation = () => {
    isAnimating.current = false;
    resetTimer();
    setRobotX(1);
    setRobotDir(0);
    setRobotY(1);
    setRobotState({ x: 1, y: 1, d: Direction.NORTH, s: -1 });
    setPage(0);
  };

  /// Example addition to the robot movement logic
  const updatePathHistory = (pathObj) => {
    setPathHistory((prev) => [...prev, { ...pathObj }]);
  };

  // Function to clear the trace
  const clearTrace = () => {
    setLeaveTrace(0);
    setPathHistory([]);
    setTraceEnabled(true); // Re-enable tracing for new paths
  };

  const [robotX, setRobotX] = useState(1);
  const [robotY, setRobotY] = useState(1);
  const [robotDir, setRobotDir] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [isComputing, setIsComputing] = useState(false);
  const [path, setPath] = useState([]);
  const [commands, setCommands] = useState([]);
  const [distance, setDistance] = useState(0);
  const [page, setPage] = useState(0);
  const [path_duration, setPathDuration] = useState([]);
  const [duration, setDuration] = useState(0);
  const [configName, setConfigName] = useState("");
  const [configurations, setConfigurations] = useState(null);
  const [leaveTrace, setLeaveTrace] = useState(false);
  const [pathHistory, setPathHistory] = useState([]);
  const [traceEnabled, setTraceEnabled] = useState(true);
  const [newpath, setnewPath] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const isAnimating = useRef(false);
  const haveConfig = useRef(false);

  useEffect(() => {
    if (page >= path.length) return;
    setRobotState(path[page]);
    setnewPath(interpolatePath(path));
  }, [page, path]);

  useEffect(() => {
    if (haveConfig.current) {
      localStorage.setItem("Configurations", JSON.stringify(configurations));
    }
  }, [obstacles, configurations]);

  const [robotState, setRobotState] = useState({
    x: 1,
    y: 1,
    d: Direction.NORTH,
    s: -1,
  });

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50">
      {/* Robot Position */}
      <div className="bg-white rounded-xl shadow-xl mb-8 p-4 w-full max-w-4xl">
        <div className="card-body items-center text-center p-4">
          <h2 className="text-2xl font-bold purple-gradient text-transparent bg-clip-text">
            MDP AY23/24 Group 7 Algorithm Simulator
          </h2>
          <h2 className="text-xl font-semibold purple-gradient text-transparent bg-clip-text">
            Robot Position
          </h2>
          <div className="form-control mt-4">
            <label className="input-group input-group-horizontal">
              <span className="purple-gradient text-white p-2 rounded-l">
                X
              </span>
              <input
                onChange={onChangeRobotX}
                type="number"
                placeholder="1"
                min="1"
                max="18"
                className="input input-bordered text-purple-900"
              />
              <span className="purple-gradient text-white p-2">Y</span>
              <input
                onChange={onChangeRobotY}
                type="number"
                placeholder="1"
                min="1"
                max="18"
                className="input input-bordered text-purple-900"
              />
              <span className="purple-gradient text-white p-2">D</span>
              <select
                onChange={onRobotDirectionInputChange}
                value={robotDir}
                className="select select-bordered text-purple-900"
              >
                <option value={ObDirection.NORTH}>Up</option>
                <option value={ObDirection.SOUTH}>Down</option>
                <option value={ObDirection.WEST}>Left</option>
                <option value={ObDirection.EAST}>Right</option>
              </select>
              <button
                className="purple-gradient text-white p-2 font-bold rounded-r"
                onClick={onClickRobot}
              >
                Set
              </button>
            </label>
          </div>
        </div>
        {/* Settings Buttons */}
        <div className="py-4 flex justify-center gap-4">
          <Button style={"gradient-btn-yellow"} onClick={onResetAll}>
            Reset All
          </Button>
          <Button style={"gradient-btn-purple"} onClick={onReset}>
            Reset Robot
          </Button>
          <Button style={"gradient-btn-cyan"} onClick={compute}>
            Submit
          </Button>
        </div>

        {path.length > 0 && (
          <div className="flex-col justify-center space-y-4">
            {/* Timer display */}
            <div className="text-center mt-4">
              <h2 className="font-semibold text-xl purple-gradient text-transparent bg-clip-text">
                Timer:{" "}
                <span className="purple-gradient text-transparent bg-clip-text">
                  {formatTimer(timer)}
                </span>
              </h2>
            </div>

            {/* Animation controls */}
            <div className="flex justify-center space-x-1">
              <Button
                style="outline-btn border-cyan-400 text-cyan-300 hover:bg-cyan-400"
                onClick={startImmediate}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="currentColor"
                  class="bi bi-skip-forward-fill"
                  viewBox="0 0 16 16"
                >
                  {" "}
                  <path d="M15.5 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V8.753l-6.267 3.636c-.54.313-1.233-.066-1.233-.697v-2.94l-6.267 3.636C.693 12.703 0 12.324 0 11.693V4.308c0-.63.693-1.01 1.233-.696L7.5 7.248v-2.94c0-.63.693-1.01 1.233-.696L15 7.248V4a.5.5 0 0 1 .5-.5z" />{" "}
                </svg>
              </Button>

              <Button style="gradient-btn-cyan" onClick={startAnimation}>
                Start Animation
              </Button>

              <Button
                style="outline-btn border-red-500 text-red-500 hover:bg-red-500"
                onClick={clearAnimation}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="0"
                    y1="32"
                    x2="32"
                    y2="0"
                    stroke-width="2"
                    stroke="currentColor"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="32"
                    y2="32"
                    stroke-width="2"
                    stroke="currentColor"
                  />
                </svg>
              </Button>
            </div>

            <div className="flex justify-center space-x-1">
              <Button
                style={
                  leaveTrace
                    ? "base-btn bg-green-400"
                    : "outline-btn border-green-400 text-green-400 hover:bg-green-400"
                }
                onClick={() => setLeaveTrace(!leaveTrace)}
              >
                {leaveTrace ? "Leave Trace: ON" : "Leave Trace: OFF"}
              </Button>

              <Button style="outline-btn-red" onClick={clearTrace}>
                Clear Trace
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex justify-center w-full max-w-6xl my-4">
        <div className="w-3/4 flex justify-center">
          <table className="content-right border-collapse border border-purple-500 w-auto text-sm">
            <tbody>
              {renderGrid()}{" "}
              {/* Ensure this function outputs rows and cells with appropriate styling */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Path Info */}
      {path.length > 0 && (
        <div className="container flex justify-center my-4">
          {/* List of path commands */}
          <div className="w-3/4">
            <div className="flex flex-col items-center text-center bg-purple-100 p-4 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-purple-700 mb-2">
                Path Commands
              </h2>
              {commands.map((_, index) => (
                <div key={index} className="text-purple-800 py-1">
                  {`Step ${index + 1}: ${commands[index]}`}
                </div>
              ))}
            </div>
          </div>

          {/* For last checkpoint */}
          <div className="w-1/4">
            <div className="flex flex-col items-center text-center bg-purple-100 p-4 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-purple-700 mb-2">
                Fastest Path
              </h2>
              <h2 className="text-xl font-semibold text-purple-500">
                Distance: {distance}cm
              </h2>
              <h2 className="text-xl font-semibold text-purple-500">
                Timing: {duration}s
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Obstacle List View */}
      {obstacles.length > 0 && (
        <div className="bg-white rounded-xl shadow-xl mb-8 p-4 w-full max-w-4xl">
          <div className="card-body items-center text-center p-4">
            <h2 className="text-xl font-semibold purple-gradient text-transparent bg-clip-text">
              Current Obstacles
            </h2>
            <div className="grid grid-cols-5 gap-5 p-5">
              {obstacles.map((ob) => {
                return (
                  <div
                    key={ob}
                    className="flex justify-evenly items-center bg-white rounded-lg shadow-md p-3 border border-purple-300 text-purple-800 cursor-pointer hover:-translate-y-2 hover:scale-105 hover:bg-purple-800 hover:text-white transition duration-150 ease-in-out"
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
              <div className="w-1/2 h-100% purple-gradient rounded-md p-1">
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

      {/* Configurations Loader */}
      <PresetLoader
        setConfigName={setConfigName}
        setObs={setObstacles}
        haveConfig={haveConfig}
        configs={configurations}
        setConfigs={setConfigurations}
      />
    </div>
  );
}
