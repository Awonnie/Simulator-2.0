import React from "react";
import Button from "./components/Button";

const NavBarDrawer = () => {
  return (
    <div className="drawer sticky top-0 z-50">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="w-full navbar border-2 border-purple-500 bg-white">
          <div className="flex navbar-start max-w-16">
            <label
              htmlFor="my-drawer-3"
              aria-label="open sidebar"
              className="cursor-pointer gradient-btn-purple text-purple-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
          <div className="flex navbar-center w-full justify-center">
            <span className="font-bold text-xl purple-gradient text-transparent bg-clip-text">
              MDP AY23/24 Group 7 Algorithm Simulator
            </span>
          </div>
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu p-4 w-1/2 min-h-full bg-white">
          {/* Sidebar content here */}
          <li className="purple-gradient text-transparent bg-clip-text">
            Preset Loader
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavBarDrawer;
