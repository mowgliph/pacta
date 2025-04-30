"use client";

import { useState } from "react";
import {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ChangePasswordPayload,
  UserChannels,
} from "@/types/user.types";

export const useUsers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllUsers = async (): Promise<User[]> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Electron está expuesto por el preload script
      const users = await window.Electron.ipcRenderer.invoke(
        UserChannels.GET_ALL
      );
      return users;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener usuarios"
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (
    payload: CreateUserPayload
  ): Promise<User | null> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Electron está expuesto por el preload script
      const user = await window.Electron.ipcRenderer.invoke(
        UserChannels.CREATE,
        payload
      );
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (
    id: string,
    payload: UpdateUserPayload
  ): Promise<User | null> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Electron está expuesto por el preload script
      const user = await window.Electron.ipcRenderer.invoke(
        UserChannels.UPDATE,
        id,
        payload
      );
      return user;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar usuario"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserActive = async (id: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Electron está expuesto por el preload script
      const user = await window.Electron.ipcRenderer.invoke(
        UserChannels.TOGGLE_ACTIVE,
        id
      );
      return user;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado del usuario"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (
    payload: ChangePasswordPayload
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      // @ts-ignore - Electron está expuesto por el preload script
      const success = await window.Electron.ipcRenderer.invoke(
        UserChannels.CHANGE_PASSWORD,
        payload
      );
      return success;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar contraseña"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getAllUsers,
    createUser,
    updateUser,
    toggleUserActive,
    changePassword,
  };
};
