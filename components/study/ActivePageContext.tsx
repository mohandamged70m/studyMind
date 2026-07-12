"use client";

import React, { createContext, useContext, useState } from "react";

interface ActivePageContextType {
  activePage: number;
  setActivePage: (page: number) => void;
}

const ActivePageContext = createContext<ActivePageContextType | undefined>(undefined);

export function ActivePageProvider({
  children,
  initialPage = 1
}: {
  children: React.ReactNode;
  initialPage?: number;
}) {
  const [activePage, setActivePage] = useState(initialPage);

  return (
    <ActivePageContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </ActivePageContext.Provider>
  );
}

export function useActivePage() {
  const context = useContext(ActivePageContext);
  if (!context) {
    throw new Error("useActivePage must be used within an ActivePageProvider");
  }
  return context;
}
