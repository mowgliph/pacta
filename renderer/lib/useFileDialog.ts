"use client";
import { useCallback } from "react";

export const useFileDialog = () => {
  const openFile = useCallback(async (options: any = {}) => {
    if (
      typeof window !== "undefined" &&
      (window.Electron as any)["files"]?.open
    ) {
      return await (window.Electron as any)["files"].open(options);
    }
    return null;
  }, []);

  const saveFile = useCallback(async (options: any = {}) => {
    if (
      typeof window !== "undefined" &&
      (window.Electron as any)["files"]?.save
    ) {
      return await (window.Electron as any)["files"].save(options);
    }
    return null;
  }, []);

  return { openFile, saveFile };
};
