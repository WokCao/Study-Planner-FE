import { createContext, useContext } from "react";

interface MenuContextType {
    isMenuShown: boolean;
    setIsMenuShown: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenuContext = () => {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error('useMenuContext must be used within a MenuContext.Provider');
    }
    return context;
};