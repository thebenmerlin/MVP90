"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setIsDark(true);
    } else if (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
};

export default ThemeToggle;
