import type React from "react";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "./button";
import { Label } from "./label";

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  onFileSelected: (file: File | null) => void;
  label: string;
  description?: string;
}

function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== "string") return "";
  // Reemplazar caracteres no seguros con guión bajo, usando regex global
  return fileName
    .replace(/\.\./g, "") // Prevenir path traversal
    .replace(/[/\\?%*:|"<>]/g, "_") // Reemplazar caracteres especiales
    .replace(/\s+/g, "_") // Reemplazar espacios con guiones bajos
    .trim();
}

export function FileUpload({
  accept = "*/*",
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
  onFileSelected,
  label,
  description,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Sanitizar y validar el nombre del archivo
    const sanitizedName = sanitizeFileName(file.name);
    if (!sanitizedName) {
      setError("Nombre de archivo inválido");
      return false;
    }

    // Validar extensión del archivo explícitamente
    const extension = sanitizedName.split(".").pop()?.toLowerCase();
    const safeExtensions = [
      "pdf",
      "doc",
      "docx",
      "jpg",
      "jpeg",
      "png",
      "txt",
      "xlsx",
      "xls",
      "csv",
    ];

    if (!extension || !safeExtensions.includes(extension)) {
      setError(
        `Extensión de archivo no permitida. Extensiones seguras: ${safeExtensions.join(
          ", "
        )}`
      );
      return false;
    }

    // Validar tipo de archivo
    if (accept !== "*/*") {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const fileType = file.type;
      const fileExtension = `.${extension}`;

      // Comprobar si el tipo MIME o la extensión están en la lista de aceptados
      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          // Es una extensión
          return fileExtension.toLowerCase() === type.toLowerCase();
        } else if (type.includes("*")) {
          // Es un patrón MIME type con wildcard
          const regex = new RegExp("^" + type.replace("*", ".*") + "$");
          return regex.test(fileType);
        } else {
          // Es un MIME type exacto
          return fileType === type;
        }
      });

      if (!isValidType) {
        setError(`Tipo de archivo no permitido. Tipos aceptados: ${accept}`);
        return false;
      }
    }

    // Validar tamaño
    if (file.size > maxSize) {
      setError(
        `El archivo es demasiado grande. Tamaño máximo: ${(
          maxSize /
          (1024 * 1024)
        ).toFixed(1)}MB`
      );
      return false;
    }

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelected(file);
      } else {
        setSelectedFile(null);
        onFileSelected(null);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelected(file);
      } else {
        setSelectedFile(null);
        onFileSelected(null);
      }
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelected(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setError(null);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <div
        className={`border-2 border-dashed rounded-md p-6 text-center ${
          dragActive ? "border-primary bg-primary/5" : "border-gray-300"
        } ${error ? "border-red-500 bg-red-50" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-md p-2 border rounded-md">
              <span className="truncate max-w-[200px]">
                {selectedFile.name}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Arrastra y suelta un archivo aquí, o
            </p>
            <Button type="button" variant="outline" onClick={handleButtonClick}>
              Seleccionar Archivo
            </Button>
            {description && (
              <p className="text-xs text-gray-500 mt-2">{description}</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
