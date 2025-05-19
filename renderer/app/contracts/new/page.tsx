import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "../../../components/ui/alert";
import { useNotification } from "../../../lib/useNotification";
import { useFileDialog } from "../../../lib/useFileDialog";
import { DropZone } from "../../../components/ui/DropZone";

interface ApiError {
  message: string;
  code?: string;
}

const initialState = {
  number: "",
  company: "",
  type: "Cliente",
  startDate: "",
  endDate: "",
  amount: "",
  description: "",
};

export default function NewContractPage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [file, setFile] = useState<File | null>(null);
  const { openFile } = useFileDialog();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileDrop = (file: File) => {
    setFile(file);
  };

  const handleSelectFromSystem = async () => {
    const result = await openFile({
      title: "Seleccionar documento de contrato",
      filters: [{ name: "Documentos", extensions: ["pdf", "doc", "docx"] }],
    });
    if (result?.filePath) {
      const fileFromPath = new File(
        [result.filePath],
        result.name || "contrato.pdf",
        {
          type: "application/pdf",
        }
      );
      setFile(fileFromPath);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.number ||
      !form.company ||
      !form.type ||
      !form.startDate ||
      !form.endDate
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (!window.Electron?.ipcRenderer) {
        throw new Error("API de contratos no disponible");
      }

      const result = await window.Electron.ipcRenderer.invoke(
        "contracts:create",
        {
          ...form,
          file: file || undefined,
        }
      );

      if (result.success) {
        notify({
          title: "Contrato creado",
          body: "El contrato se ha creado correctamente",
          variant: "success",
        });
        navigate("/contracts");
      } else {
        throw new Error(result.error || "Error al crear el contrato");
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || "Error al crear el contrato");
      notify({
        title: "Error",
        body: error.message || "Error al crear el contrato",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Nuevo Contrato</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Input
            name="number"
            placeholder="Número de contrato"
            value={form.number}
            onChange={handleChange}
            required
          />
          <Input
            name="company"
            placeholder="Empresa"
            value={form.company}
            onChange={handleChange}
            required
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="Cliente">Cliente</option>
            <option value="Proveedor">Proveedor</option>
          </select>
          <Input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />
          <Input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
          />
          <Input
            type="number"
            name="amount"
            placeholder="Monto"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
          />

          <DropZone onFileDrop={handleFileDrop} />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/contracts")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear Contrato"}
          </Button>
        </div>
      </form>
    </div>
  );
}
