import React, { useRef } from "react";

interface DropZoneProps {
  onFileDrop: (file: File) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileDrop }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      className="border-2 border-dashed border-[#018ABE] rounded-lg p-6 text-center cursor-pointer bg-[#F5F5F5] hover:bg-[#D6E8EE] transition-colors"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      tabIndex={0}
      aria-label="Arrastra y suelta un archivo aquí"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter") inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileDrop(e.target.files[0]);
          }
        }}
        aria-label="Seleccionar archivo"
      />
      <span className="block text-[#018ABE] font-medium">
        Arrastra y suelta un archivo aquí o haz clic para seleccionar
      </span>
    </div>
  );
};
