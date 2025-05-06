import React from "react";

interface UpdateBannerProps {
  visible: boolean;
  onRestart: () => void;
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({
  visible,
  onRestart,
}) => {
  if (!visible) return null;
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[#FF9800] text-white flex items-center justify-between px-6 py-3 shadow-lg animate-fade-in">
      <span className="font-medium">
        Hay una actualización disponible. Es necesario reiniciar la aplicación.
      </span>
      <button
        className="ml-4 px-4 py-2 rounded bg-white text-[#FF9800] font-semibold hover:bg-[#FFF3E0] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        onClick={onRestart}
        tabIndex={0}
        aria-label="Reiniciar aplicación"
      >
        Reiniciar ahora
      </button>
    </div>
  );
};
