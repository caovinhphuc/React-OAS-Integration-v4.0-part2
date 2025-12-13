import { useState, useEffect } from "react";
import { validateConfig } from "../config/googleConfig";

export const useConfigValidation = () => {
  const [configValid, setConfigValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        setIsLoading(true);
        const isValid = validateConfig();
        setConfigValid(isValid);
      } catch (error) {
        console.error("Config validation error:", error);
        setConfigValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConfig();
  }, []);

  return { configValid, isLoading };
};
