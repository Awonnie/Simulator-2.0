export default function Configurations() {
  const configList = JSON.parse(localStorage.getItem("Configurations"));

  const loadConfig = () => {
    console.log(configList);
  };

  return (
    <>
      {configList && (
        <div className="bg-white rounded-xl shadow-xl mb-8 p-4 w-full max-w-4xl">
          <div className="card-body items-center text-center p-4">
            <h2 className="text-xl font-semibold text-purple-700 mb-5">
              Configurations
            </h2>
            <div className="container flex-col">
              {Object.keys(configList).map((key) => (
                <div key={key} className="container flex justify-evenly p-2">
                  <div className="w-1/2 flex items-center border-b-2 border-gray-300">
                    <p className="font-bold text-black text-center">{key}</p>
                  </div>
                  <button
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    onClick={loadConfig}
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
