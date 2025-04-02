import React from 'react';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import '../src/index.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <Layout>
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-red-800">
            Error inesperado
          </h1>
          <p className="mt-2 text-red-700">
            Ha ocurrido un error al cargar esta página.
          </p>
          <pre className="mt-4 max-w-lg overflow-auto rounded bg-red-100 p-4 text-left text-sm text-red-900">
            {error instanceof Error
              ? error.message
              : JSON.stringify(error, null, 2)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Reintentar
          </button>
        </div>
      </div>
    </Layout>
  );
} 