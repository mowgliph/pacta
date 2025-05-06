"use client";
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

type NotificationOptions = {
  title: string;
  body: string;
  variant?: "default" | "success" | "destructive" | "warning" | "info";
  description?: string;
  silent?: boolean;
};

export const useNotification = () => {
  const { toast } = useToast();

  const notify = useCallback(
    async ({
      title,
      body,
      variant = "default",
      description,
      silent = false,
    }: NotificationOptions) => {
      if (
        typeof window !== "undefined" &&
        (window.Electron as any)["notifications"]?.show
      ) {
        (window.Electron as any)["notifications"].show({
          title,
          body,
          silent,
        });
      }
      toast({
        title,
        description: description || body,
        variant,
      });
    },
    [toast]
  );

  return { notify };
};
