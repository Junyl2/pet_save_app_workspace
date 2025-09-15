"use client";

import React, { useState } from "react";
import styles from "./Dropdown.module.css";
import { FiChevronDown } from "react-icons/fi";

interface DropdownProps {
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function Dropdown({
  options,
  defaultValue,
  onChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || options[0]);

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{selected}</span>
        <FiChevronDown
          className={`${styles.icon} ${isOpen ? styles.open : ""}`}
        />
      </button>

      {isOpen && (
        <div className={styles.menu}>
          {options.map((option, index) => (
            <div
              key={index}
              className={`${styles.menuItem} ${
                option === selected ? styles.selected : styles.unselected
              }`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
