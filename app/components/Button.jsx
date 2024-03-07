"use client";

const Button = ({ children, style, onClick }) => (
  <button className={style} onClick={onClick}>
    {children}
  </button>
);

export default Button;
