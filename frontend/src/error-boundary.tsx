import { useRouteError, isRouteErrorResponse, Link } from "@remix-run/react";

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4">
          <h1 className="mb-4 text-4xl font-bold text-primary md:text-6xl">
            {error.status}
          </h1>
          <h2 className="mb-8 text-xl font-semibold md:text-2xl">
            {error.statusText || 'Ha ocurrido un error'}
          </h2>
          <p className="mb-8 text-muted-foreground">
            {error.data?.message || 'Lo sentimos, ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.'}
          </p>
          <Link
            to="/"
            className="rounded bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4">
        <h1 className="mb-4 text-4xl font-bold text-primary md:text-6xl">
          Error
        </h1>
        <h2 className="mb-8 text-xl font-semibold md:text-2xl">
          Ha ocurrido un error inesperado
        </h2>
        <p className="mb-8 text-muted-foreground">
          Lo sentimos, ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.
        </p>
        <Link
          to="/"
          className="rounded bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
} 