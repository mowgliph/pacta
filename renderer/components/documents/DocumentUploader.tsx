import { useCallback, useState } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileIcon, UploadIcon } from "@radix-ui/react-icons";

interface DocumentUploaderProps {
  contractId?: string;
  onUploadComplete?: (document: any) => void;
}

export const DocumentUploader = ({
  contractId,
  onUploadComplete,
}: DocumentUploaderProps) => {
  const { uploadDocument, isLoading } = useDocuments();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFile(file);
      }
    },
    []
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadDocument(selectedFile, {
        contractId,
        category: "document",
        description: selectedFile.name,
      });

      if (result && onUploadComplete) {
        onUploadComplete(result);
        setSelectedFile(null);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error("Error al subir el documento:", error);
    }
  }, [selectedFile, contractId, uploadDocument, onUploadComplete]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="h-5 w-5" />
          Subir Documento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="document">Documento</Label>
            <div className="flex items-center gap-2">
              <Input
                id="document"
                type="file"
                onChange={handleFileChange}
                disabled={isLoading}
                className="cursor-pointer"
              />
              {selectedFile && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileIcon className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Subiendo documento...
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="w-full"
          >
            {isLoading ? "Subiendo..." : "Subir Documento"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
