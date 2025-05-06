"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { FilePlus, ArrowLeft } from "lucide-react";
import { useCreateSupplement } from "@/lib/useCreateSupplement";
import { useNotification } from "@/lib/useNotification";
import { useFileDialog } from "@/lib/useFileDialog";

const campos = [
  { value: "amount", label: "Monto" },
  { value: "endDate", label: "Fecha de Fin" },
  { value: "description", label: "Descripción" },
  { value: "type", label: "Tipo de Cliente" },
];

export default function NewSupplementPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const contractId = params.id;
  const [field, setField] = useState("");
  const [newValue, setNewValue] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { createSupplement, loading, error, success, setError, setSuccess } =
    useCreateSupplement();
  const { notify } = useNotification();
  const { openFile } = useFileDialog();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!field || !newValue || !description) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    const result = await createSupplement({
      contractId,
      field,
      newValue,
      description,
      file,
    });
    if (result.success) {
      notify({
        title: "Suplemento guardado",
        body: "El suplemento se guardó correctamente.",
        variant: "success",
      });
      setTimeout(() => router.push(`/contracts/${contractId}`), 1200);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 flex flex-col gap-8">
      <button
        className="flex items-center gap-2 text-[#018ABE] hover:underline text-sm w-fit mb-2"
        onClick={() => router.push(`/contracts/${contractId}`)}
      >
        <ArrowLeft size={18} /> Volver al contrato
      </button>
      <Card>
        <CardHeader>
          <CardTitle>Nuevo Suplemento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="success">
                <AlertTitle>Éxito</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                Campo a modificar
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={field}
                onChange={(e) => setField(e.target.value)}
                required
              >
                <option value="">Selecciona un campo</option>
                {campos.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nuevo valor
              </label>
              <Input
                value={newValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewValue(e.target.value)
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Descripción / Motivo
              </label>
              <Input
                value={description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDescription(e.target.value)
                }
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
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const result = await openFile({
                      title: "Seleccionar documento",
                      filters: [
                        {
                          name: "Documentos",
                          extensions: ["pdf", "doc", "docx"],
                        },
                      ],
                    });
                    if (result && result.filePaths && result.filePaths[0]) {
                      // Leer el archivo seleccionado y convertirlo a File
                      // (esto requiere lógica adicional si se desea cargar el archivo al backend)
                    }
                  }}
                >
                  Seleccionar desde sistema
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-fit mt-2" disabled={loading}>
              <FilePlus size={18} className="mr-2" /> Guardar Suplemento
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
