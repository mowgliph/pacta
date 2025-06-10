import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { LegalRepresentativeValues } from "@/schemas/contract.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconUpload, IconX } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";

interface LegalRepresentativeFormProps {
  className?: string;
}

export function LegalRepresentativeForm({ className = "" }: { className?: string }) {
  const { register, formState: { errors }, watch, setValue } = useFormContext<LegalRepresentativeValues>();

  const getErrorMessage = (path: keyof LegalRepresentativeValues) => {
    return errors?.[path]?.message || '';
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="legalRepresentative.name">Nombre</Label>
          <Input
            id="legalRepresentative.name"
            placeholder="Nombre del representante"
            {...register("name", {
              required: "El nombre del representante legal es requerido"
            })}
            className="mt-2"
          />
          {errors.name?.message && (
            <p className="text-sm text-destructive mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="legalRepresentative.position">Cargo</Label>
          <Input
            id="legalRepresentative.position"
            placeholder="Cargo o posición"
            {...register("position", {
              required: "El cargo del representante legal es requerido"
            })}
            className="mt-2"
          />
          {getErrorMessage('position') && (
            <p className="text-sm text-destructive mt-1">
              {getErrorMessage('position')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="legalRepresentative.documentType">Tipo de documento</Label>
          <Input
            id="legalRepresentative.documentType"
            placeholder="Tipo de documento"
            {...register("documentType")}
            className="mt-2"
          />
          {getErrorMessage('documentType') && (
            <p className="text-sm text-destructive mt-1">
              {getErrorMessage('documentType')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="legalRepresentative.documentNumber">Número de documento</Label>
          <Input
            id="legalRepresentative.documentNumber"
            placeholder="Número de documento"
            {...register("documentNumber")}
            className="mt-2"
          />
          {getErrorMessage('documentNumber') && (
            <p className="text-sm text-destructive mt-1">
              {getErrorMessage('documentNumber')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="legalRepresentative.documentDate">Fecha de documento</Label>
          <Input
            id="legalRepresentative.documentDate"
            type="date"
            {...register("documentDate")}
            className="mt-2"
          />
          {getErrorMessage('documentDate') && (
            <p className="text-sm text-destructive mt-1">
              {getErrorMessage('documentDate')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="legalRepresentative.email">Email</Label>
          <Input
            id="legalRepresentative.email"
            type="email"
            placeholder="Email del representante"
            {...register("email")}
            className="mt-2"
          />
          {getErrorMessage('email') && (
            <p className="text-sm text-destructive mt-1">
              {getErrorMessage('email')}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="legalRepresentative.phone">Teléfono</Label>
          <Input
            id="legalRepresentative.phone"
            placeholder="Teléfono del representante"
            {...register("phone")}
            className="mt-2"
          />
          {getErrorMessage('phone') && (
            <p className="text-sm text-destructive mt-1">
              {getErrorMessage('phone')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="legalRepresentative.companyName">Nombre de la empresa</Label>
          <Input
            id="legalRepresentative.companyName"
            placeholder="Nombre de la empresa"
            {...register("companyName", {
              required: "El nombre de la empresa es requerido"
            })}
            className="mt-2"
          />
          {getErrorMessage('companyName') && (
            <p className="text-sm text-destructive mt-1">
              {getErrorMessage('companyName')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="legalRepresentative.companyAddress">Dirección de la empresa</Label>
          <Input
            id="legalRepresentative.companyAddress"
            placeholder="Dirección de la empresa"
            {...register("companyAddress")}
            className="mt-2"
          />
          {getErrorMessage('companyAddress') && (
            <p className="text-sm text-destructive mt-1">
              {getErrorMessage('companyAddress')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="legalRepresentative.companyPhone">Teléfono de la empresa</Label>
          <Input
            id="legalRepresentative.companyPhone"
            placeholder="Teléfono de la empresa"
            {...register("companyPhone")}
            className="mt-2"
          />
          {getErrorMessage('companyPhone') && (
            <p className="text-sm text-destructive mt-1">
              {getErrorMessage('companyPhone')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="legalRepresentative.companyEmail">Email de la empresa</Label>
          <Input
            id="legalRepresentative.companyEmail"
            type="email"
            placeholder="Email de la empresa"
            {...register("companyEmail")}
            className="mt-2"
          />
          {getErrorMessage('companyEmail') && (
            <p className="text-sm text-destructive mt-1">
              {getErrorMessage('companyEmail')}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="legalRepresentative.documentDescription">Descripción del documento</Label>
          <Input
            id="legalRepresentative.documentDescription"
            placeholder="Descripción del documento"
            {...register("documentDescription")}
            className="mt-2"
          />
          {errors.documentDescription?.message && (
            <p className="text-sm text-destructive mt-1">
              {errors.documentDescription.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="legalRepresentative.document">Documento</Label>
          <div className="flex items-center gap-2 mt-2">
            <input
              id="legalRepresentative.document"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setValue("document", file);
                }
              }}
              className="hidden"
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => document.getElementById('legalRepresentative.document')?.click()}
            >
              <IconUpload className="w-4 h-4 mr-2" />
              Seleccionar archivo
            </Button>
            {watch("document") && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {watch("document")?.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setValue("document", undefined)}
                >
                  <IconX className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
