import { createContext, useContext, useState } from "react";

export const NavBarContext = createContext({
  isScrolled: false,
  setIsScrolled: (s: boolean) => {},
});

export function useNavBar() {
  return useContext(NavBarContext);
}

export function NavBarProvider({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  return (
    <NavBarContext.Provider value={{ isScrolled, setIsScrolled }}>
      {children}
    </NavBarContext.Provider>
  );
}