"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNotification } from "@/lib/useNotification";
import { useFileDialog } from "@/lib/useFileDialog";

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
  const router = useRouter();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSelectFromSystem = async () => {
    const result = await openFile({
      title: "Seleccionar documento de contrato",
      filters: [{ name: "Documentos", extensions: ["pdf", "doc", "docx"] }],
    });
    if (result && result.filePaths && result.filePaths[0]) {
      // Leer el archivo y convertirlo a File si es necesario
      // (esto requiere lógica adicional si se desea cargar el archivo al backend)
      // Por simplicidad, solo guardamos la ruta temporalmente
      setFile({
        name: result.filePaths[0].split("/").pop() || "documento.pdf",
        path: result.filePaths[0],
        // No hay buffer, solo ruta
      } as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let attachmentPath = null;
      if (file) {
        // Leer el archivo como buffer y enviarlo por IPC
        const arrayBuffer = await file.arrayBuffer?.();
        const buffer = arrayBuffer ? Buffer.from(arrayBuffer) : undefined;
        // @ts-ignore
        const uploadRes = await window.Electron.contracts.upload({
          name: file.name,
          data: buffer,
          type: file.type || "application/pdf",
        });
        attachmentPath = uploadRes?.path;
      }
      // @ts-ignore
      const res = await window.Electron.contracts.create({
        ...form,
        amount: parseFloat(form.amount),
        attachment: attachmentPath,
      });
      if (res.success) {
        notify({
          title: "Contrato guardado",
          body: "El contrato se guardó correctamente.",
          variant: "success",
        });
        setTimeout(() => router.push(`/contracts/${res.data.id}`), 1200);
      } else {
        setError(res.error?.message || "No se pudo crear el contrato.");
      }
    } catch (err: any) {
      setError(err?.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-[#001B48] font-inter mb-4">
        Nuevo Contrato
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white rounded-xl shadow p-6"
      >
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">
            Número de contrato
          </label>
          <Input
            name="number"
            value={form.number}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Empresa</label>
          <Input
            name="company"
            value={form.company}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="Cliente">Cliente</option>
            <option value="Proveedor">Proveedor</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha de inicio
          </label>
          <Input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de fin</label>
          <Input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Monto</label>
          <Input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Adjuntar documento (opcional)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              aria-label="Seleccionar archivo adjunto"
              tabIndex={0}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectFromSystem}
              aria-label="Seleccionar desde sistema"
              tabIndex={0}
            >
              Seleccionar desde sistema
            </Button>
            {file && <span className="text-xs ml-2">{file.name}</span>}
          </div>
        </div>
        <Button type="submit" className="w-fit mt-2" disabled={loading}>
          Guardar Contrato
        </Button>
      </form>
    </div>
  );
}
