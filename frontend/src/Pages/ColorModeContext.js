import React, { createContext, useContext, useState } from "react";

const ColorModeContext = createContext();

export const useColorModeContext = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }) => {
  const [colorMode, setColorMode] = useState("light");

  const toggleColorMode = () => {
    setColorMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};
