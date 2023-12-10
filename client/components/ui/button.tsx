import React from "react";

const Button: React.FC<any> = ({ children, className, onClick, ariaLabel, disabled}: any) => {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={`px-2 py-2 border rounded-lg ${className}`}>
      {children}
    </button>
  );
};

export default Button;
