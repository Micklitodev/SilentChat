import React from "react";
import { InputProps } from "@/lib/types";

const Input: React.FC<InputProps> = ({
  id,
  placeholder,
  type,
  name,
  className,
  onChange,
  value,
  onKeyDown

}: any) => {
  return (
    <input
      className={`${className} rounded py-2 px-2 flex wrap border border-white bg-black text-green-400`}
      id={id}
      type={type}
      placeholder={placeholder}
      name={name}
      onChange={onChange}
      value={value}
      onKeyDown={onKeyDown}
    />
  );
};

export default Input;
