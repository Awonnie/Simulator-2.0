"use client";

import { buttonStyles } from "@/constants";

const Button = ({ children, style, onClick }) => (
  <button
    className={buttonStyles[style] ? buttonStyles[style] : style}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button;
