import Button from "./components/Button";

export default function PresetLoader({
  setConfigName,
  setObstacles,
  configurations,
}) {
  const loadConfig = (name, ob) => {
    setObstacles(ob);
    setConfigName(name);
  };
  const deleteConfig = (name, ob) => {
    setObstacles(ob);
    setConfigName(name);
  };

  return (
    <>
      {configurations && (
        <div className="flex justify-center max-h-96 w-full overflow-y-scroll bg-gray-800 rounded-xl border-2 border-theme-gold mb-8 p-4 no-scrollbar">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th className="font-bold text-lg gradient-main-light text-transparent bg-clip-text">
                  Preset Name
                </th>
                <th className="font-bold text-lg gradient-main-light text-transparent bg-clip-text">
                  Number of Obstacles
                </th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {Object.entries(configurations).map(([key, value]) => (
                <tr>
                  <th></th>
                  <td className="font-semibold text-base gradient-main-light text-transparent bg-clip-text">
                    {key}
                  </td>
                  <td className="font-semibold text-base gradient-main-light text-transparent bg-clip-text">
                    {value.length}
                  </td>
                  <td>
                    <Button
                      style={"gradient-btn-purple"}
                      onClick={() => loadConfig(key, value)}
                    >
                      Load
                    </Button>
                  </td>
                  <td>
                    <Button
                      style={"outline-btn-red"}
                      onClick={() => deleteConfig(key, value)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
