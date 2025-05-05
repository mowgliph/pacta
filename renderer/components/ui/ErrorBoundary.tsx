import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Aquí puedes enviar logs a un servicio externo si lo deseas
    // console.error("Error capturado por ErrorBoundary:", error, errorInfo)
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] px-4">
          <div
            className="flex flex-col items-center bg-white rounded-xl shadow-md p-8 animate-fade-in"
            style={{ maxWidth: 400 }}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#D6E8EE] mb-4">
              <span
                role="img"
                aria-label="error"
                className="text-[#018ABE] text-4xl"
              >
                ⚠️
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#001B48] font-inter mb-2">
              ¡Ha ocurrido un error!
            </h1>
            <p className="text-[#757575] text-center mb-6">
              Algo salió mal en la aplicación.
              <br />
              Por favor, intenta recargar la página.
              <br />
              <span className="text-xs text-[#F44336]">
                {this.state.error?.message}
              </span>
            </p>
            <button
              className="bg-[#018ABE] hover:bg-[#02457A] text-white rounded px-4 py-2"
              onClick={this.handleReload}
            >
              Reintentar
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
