"use client";

import type { AppProps } from "next/app";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "../components/providers/theme-provider";
import { Toaster } from "sonner";
import { MainLayout } from "../components/layout/main-layout";
import { queryClient } from "../api/api";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "../context/auth-provider";
import "../styles/globals.css";

export default function App({ Component, pageProps, router }: AppProps) {
  // Determinar si la ruta actual es una página de autenticación
  const isAuthPage = router.pathname.startsWith('/auth');

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AnimatePresence mode="wait" initial={false}>
            {isAuthPage ? (
              <Component {...pageProps} />
            ) : (
              <MainLayout key={router.route}>
                <Component {...pageProps} />
              </MainLayout>
            )}
          </AnimatePresence>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
