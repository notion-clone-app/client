import { useEffect, useState } from "react";

export const useWindowScroll = () => {
  const [currentScrollOffsetY, setCurrentScrollOffsetY] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => setCurrentScrollOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    return () => {
      setCurrentScrollOffsetY(0);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return {
    currentScrollOffsetY,
  };
};
