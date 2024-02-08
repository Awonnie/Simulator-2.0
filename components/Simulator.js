import { useEffect, useState } from "react";
import QueryAPI from "./QueryAPI";

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

const transformCoord = (x, y) => {
  // Change the coordinate system from (0, 0) at top left to (0, 0) at bottom left
  return { x: 19 - y, y: x };
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

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
        x: start.x + stepX,
        y: start.y + stepY,
      });
    }
  }

  // Ensure the final position is included
  interpolatedPath.push(path[path.length - 1]);

  return interpolatedPath;
}

export default function Simulator() {
  const [robotState, setRobotState] = useState({
    x: 1,
    y: 1,
    d: Direction.NORTH,
    s: -1,
  });
  const [robotX, setRobotX] = useState(1);
  const [robotY, setRobotY] = useState(1);
  const [robotDir, setRobotDir] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [obXInput, setObXInput] = useState(0);
  const [obYInput, setObYInput] = useState(0);
  const [directionInput, setDirectionInput] = useState(ObDirection.NORTH);
  const [isComputing, setIsComputing] = useState(false);
  const [path, setPath] = useState([]);
  const [commands, setCommands] = useState([]);
  const [distance, setDistance] = useState(0); // Assuming distance is a numeric value
  const [page, setPage] = useState(0);
  const [path_duration, setPathDuration] = useState([]);
  const [duration, setDuration] = useState(0);

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

  const onChangeX = (event) => {
    // If the input is an integer and is in the range [0, 19], set ObXInput to the input
    if (Number.isInteger(Number(event.target.value))) {
      const nb = Number(event.target.value);
      if (0 <= nb && nb < 20) {
        setObXInput(nb);
        return;
      }
    }
    // If the input is not an integer or is not in the range [0, 19], set the input to 0
    setObXInput(0);
  };

  const onChangeY = (event) => {
    // If the input is an integer and is in the range [0, 19], set ObYInput to the input
    if (Number.isInteger(Number(event.target.value))) {
      const nb = Number(event.target.value);
      if (0 <= nb && nb <= 19) {
        setObYInput(nb);
        return;
      }
    }
    // If the input is not an integer or is not in the range [0, 19], set the input to 0
    setObYInput(0);
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

  const onClickObstacle = () => {
    // If the input is not valid, return
    if (!obXInput && !obYInput) return;
    // Create a new array of obstacles
    const newObstacles = [...obstacles];
    // Add the new obstacle to the array
    newObstacles.push({
      x: obXInput,
      y: obYInput,
      d: directionInput,
      id: generateNewID(),
    });
    // Set the obstacles to the new array
    setObstacles(newObstacles);
  };

  const onClickRobot = () => {
    // Set the robot state to the input

    setRobotState({ x: robotX, y: robotY, d: robotDir, s: -1 });
  };

  const onDirectionInputChange = (event) => {
    // Set the direction input to the input
    setDirectionInput(Number(event.target.value));
  };

  const onRobotDirectionInputChange = (event) => {
    // Set the robot direction to the input
    setRobotDir(event.target.value);
  };

  const onRemoveObstacle = (ob) => {
    // If the path is not empty or the algorithm is computing, return
    if (path.length > 0 || isComputing) return;
    // Create a new array of obstacles
    const newObstacles = [];
    // Add all the obstacles except the one to remove to the new array
    for (const o of obstacles) {
      if (o.x === ob.x && o.y === ob.y) continue;
      newObstacles.push(o);
    }
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
        setPathDuration(data.data.path_time);

        // Total Duration of the entire path
        setDuration(data.data.duration);

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
        setDistance(data.data.distance); // Update this line to set the distance
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

        for (const ob of obstacles) {
          const transformed = transformCoord(ob.x, ob.y);
          if (transformed.x === i && transformed.y === j) {
            foundOb = ob;
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
              <td className="border border-l-4 border-l-red-500 w-5 h-5 md:w-8 md:h-8 bg-blue-700" />
            );
          } else if (foundOb.d === Direction.EAST) {
            cells.push(
              <td className="border border-r-4 border-r-red-500 w-5 h-5 md:w-8 md:h-8 bg-blue-700" />
            );
          } else if (foundOb.d === Direction.NORTH) {
            cells.push(
              <td className="border border-t-4 border-t-red-500 w-5 h-5 md:w-8 md:h-8 bg-blue-700" />
            );
          } else if (foundOb.d === Direction.SOUTH) {
            cells.push(
              <td className="border border-b-4 border-b-red-500 w-5 h-5 md:w-8 md:h-8 bg-blue-700" />
            );
          } else if (foundOb.d === Direction.SKIP) {
            cells.push(
              <td className="border w-5 h-5 md:w-8 md:h-8 bg-blue-700" />
            );
          }
        } else if (foundRobotCell) {
          if (foundRobotCell.d !== null) {
            cells.push(
              <td
                className={`border w-5 h-5 md:w-8 md:h-8 ${
                  foundRobotCell.s != -1 ? "bg-red-500" : "bg-yellow-300"
                }`}
              />
            );
          } else {
            cells.push(
              <td className="bg-green-600 border-white border w-5 h-5 md:w-8 md:h-8" />
            );
          }
        } else {
          cells.push(
            <td className="border-black border w-5 h-5 md:w-8 md:h-8" />
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

  const [newpath, setnewPath] = useState([]);
  const [newpage, setnewPage] = useState(0); // Using page to track current step in the path
  const [isAnimating, setIsAnimating] = useState(false);

  // New state variable for the timer
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  // Define timerInterval as a state variable
  const [timerInterval, setTimerInterval] = useState(null);

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

  // Function to format the timer value into HH:mm:ss format
  const formatTimer = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  };

  // Function to pad a number with leading zeros if it's less than 10
  const padZero = (num) => (num < 10 ? `0${num}` : num);

  useEffect(() => {
    if (newpage >= newpath.length) {
      setIsAnimating(false); // Stop the animation if we've reached the end of the path
      return;
    }
    setRobotState(newpath[newpage]); // Update robot state based on the current step in the path
  }, [newpage, newpath]);

  // Start the animation
  useEffect(() => {
    let animationInterval;

    if (isAnimating) {
      // Need to add Switch case here to vary movement depending on command
      // 1) Starting speed -> prof mentioned that when the robot start e.g. path == 0, then the speed is slower as compared to if path == 2
      // 2) Stopping speed
      // 3) Time taken to snap a picture
      // 4) Turning command -> time taken to rotate?
      // Consider adding one more variable to the path d,s,x,y to signal a change in direction or robot stopping and starting to properly mimic

      animationInterval = setInterval(() => {
        setnewPage((currentPage) => {
          if (currentPage < newpath.length - 1) {
            return currentPage + 1;
          } else {
            clearInterval(animationInterval); // Stop the animation at the end
            stopTimer();
            return currentPage; // Keep at last step
          }
        });
      }, 800);
    }
    return () => {
      clearInterval(animationInterval);
    };
  }, [isAnimating, newpath.length, timerInterval, timerRunning]);

  async function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  // Function to start the animation
  const startAnimation = async () => {
    // setnewPath(interpolatePath(path));
    // if (newpath.length > 0 && !isAnimating) {
    //   setnewPage(0); // Reset to start position before animating
    //   setIsAnimating(true); // Start the animation
    //   startTimer();
    // }
    startTimer();
    console.log(path_duration);
    for (let i = 0; i < path_duration.length; i++) {
      await sleep(path_duration[i]);
      setPage(i);
      if (i + 1 == +path_duration.length) stopTimer();
    }
  };

  // Function to clear the animation
  const clearAnimation = () => {
    // setnewPage(0); // Reset to start position before animating
    setIsAnimating(false); // Start the animation
    resetTimer();
    setRobotX(1);
    setRobotDir(0);
    setRobotY(1);
    setRobotState({ x: 1, y: 1, d: Direction.NORTH, s: -1 });
    setPage(0);
  };

  useEffect(() => {
    if (page >= path.length) return;
    setRobotState(path[page]);
  }, [page, path]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-purple-700">
          MDP AY23/24 Group 7 Algorithm Simulator
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-xl mb-8 p-4 w-full max-w-4xl">
        <div className="card-body items-center text-center p-4">
          <h2 className="text-xl font-semibold text-purple-700">
            Robot Position
          </h2>
          <div className="form-control mt-4">
            <label className="input-group input-group-horizontal">
              <span className="bg-purple-500 text-white p-2 rounded-l">X</span>
              <input
                onChange={onChangeRobotX}
                type="number"
                placeholder="1"
                min="1"
                max="18"
                className="input input-bordered text-purple-900"
              />
              <span className="bg-purple-500 text-white p-2">Y</span>
              <input
                onChange={onChangeRobotY}
                type="number"
                placeholder="1"
                min="1"
                max="18"
                className="input input-bordered text-purple-900"
              />
              <span className="bg-purple-500 text-white p-2">D</span>
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
                className="btn bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-r"
                onClick={onClickRobot}
              >
                Set
              </button>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xl mb-8 p-4 w-full max-w-4xl">
        <div className="card-body items-center text-center p-4">
          <h2 className="text-xl font-semibold text-purple-700">
            Add Obstacles
          </h2>
          <div className="form-control mt-4">
            <label className="input-group">
              <span className="bg-purple-500 text-white p-2 rounded-l">X</span>
              <input
                onChange={onChangeX}
                type="number"
                placeholder="1"
                min="0"
                max="19"
                className="input input-bordered text-purple-900"
              />
              <span className="bg-purple-500 text-white p-2">Y</span>
              <input
                onChange={onChangeY}
                type="number"
                placeholder="1"
                min="0"
                max="19"
                className="input input-bordered text-purple-900"
              />
              <span className="bg-purple-500 text-white p-2">D</span>
              <select
                onChange={onDirectionInputChange}
                value={directionInput}
                className="select select-bordered text-purple-900"
              >
                <option value={ObDirection.NORTH}>Up</option>
                <option value={ObDirection.SOUTH}>Down</option>
                <option value={ObDirection.WEST}>Left</option>
                <option value={ObDirection.EAST}>Right</option>
                <option value={ObDirection.SKIP}>None</option>
              </select>
              <button
                className="btn bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-r"
                onClick={onClickObstacle}>
                Add
              </button>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 p-4">
        {obstacles.map((ob) => {
          return (
            <div
              key={ob}
              className="flex justify-between items-center bg-white rounded-lg shadow-md p-3 border border-purple-300">
              <div flex flex-col className="text-purple-800">
                <div className="font-semibold">X: {ob.x}</div>
                <div className="font-semibold">Y: {ob.y}</div>
                <div className="font-semibold">D: {DirectionToString[ob.d]}</div>
              </div>
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-4 h-4 stroke-current"
                  onClick={() => onRemoveObstacle(ob)}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      <div className="py-4 flex justify-center gap-4">
        <button
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-2 px-4 rounded shadow-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 transition duration-150 ease-in-out"
          onClick={onResetAll}
        >
          Reset All
        </button>
        <button
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          onClick={onReset}
        >
          Reset Robot
        </button>
        <button
          className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          onClick={compute}
        >
          Submit
        </button>
      </div>

      {/* Timer display */}
      <div className="text-center mt-4">
        <h2 className="font-semibold text-xl text-purple-700">
          Timer: <span className="text-purple-500">{formatTimer(timer)}</span>
        </h2>
      </div>

      {/* Animation controls */}
      <div className="flex justify-center gap-4 py-4">

        <button
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          onClick={startAnimation}>
          Immediate
        </button>

        <button
          className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          onClick={clearAnimation}>
          Clear Immediate
        </button>

        <button
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          onClick={startAnimation}>
          Start Animation
        </button>

        <button
          className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          onClick={clearAnimation}>
          Clear Animation
        </button>
      </div>

      <div className="flex flex-row w-full max-w-6xl">
        {/* Grid */}
        <div className="w-3/4 pr-4">
          <table className="border-collapse border border-purple-500 w-full text-sm">
            <tbody>
              {renderGrid()}{" "}
              {/* Ensure this function outputs rows and cells with appropriate styling */}
            </tbody>
          </table>
        </div>

        {/* List of path commands */}
        <div className="w-1/4">
          <div className="flex flex-col items-center text-center bg-purple-100 p-4 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-purple-700 mb-2">
              Path Commands
            </h2>
            {path.map((_, index) => (
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
            <h2 className="text-xl font-semibold">Distance: {distance}cm</h2>
            <h2 className="text-xl font-semibold">Timing: {duration}s</h2>
          </div>
        </div>

      </div>
    </div>
  );
}
