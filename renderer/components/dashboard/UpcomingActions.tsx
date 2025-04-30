import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

interface UpcomingActionsProps {
  upcomingContracts: Array<{
    id: string;
    title: string;
    contractNumber: string;
    endDate: Date;
    owner: {
      name: string;
      email: string;
    };
  }>;
  pendingSupplements: Array<{
    id: string;
    description: string;
    createdAt: Date;
    contract: {
      title: string;
      contractNumber: string;
    };
    createdBy: {
      name: string;
    };
  }>;
  isLoading?: boolean;
}

export function UpcomingActions({
  upcomingContracts,
  pendingSupplements,
  isLoading = false,
}: UpcomingActionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[200px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Próximas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <h3 className="font-medium">Contratos por Vencer</h3>
            </div>
            <div className="space-y-2">
              {upcomingContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-yellow-50"
                >
                  <div>
                    <div className="font-medium">{contract.title}</div>
                    <div className="text-sm text-gray-500">
                      {contract.contractNumber} - {contract.owner.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      {new Date(contract.endDate).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/contracts/${contract.id}`}>Ver</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-blue-500" />
              <h3 className="font-medium">Suplementos Pendientes</h3>
            </div>
            <div className="space-y-2">
              {pendingSupplements.map((supplement) => (
                <div
                  key={supplement.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-blue-50"
                >
                  <div>
                    <div className="font-medium">
                      {supplement.contract.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {supplement.contract.contractNumber} -{" "}
                      {supplement.createdBy.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {new Date(supplement.createdAt).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/contracts/${supplement.contract.contractNumber}/supplements/${supplement.id}`}
                      >
                        Ver
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
