import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

interface Contract {
  id: string;
  name: string;
  endDate: string;
  daysUntilExpiration: number;
  status: "active" | "expired" | "pending";
}

interface UpcomingExpirationsProps {
  contracts: Contract[];
}

export function UpcomingExpirations({ contracts }: UpcomingExpirationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Expiraciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="space-y-1">
                <p className="font-medium">{contract.name}</p>
                <p className="text-sm text-gray-500">
                  Expira: {new Date(contract.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    contract.daysUntilExpiration <= 30
                      ? "destructive"
                      : contract.daysUntilExpiration <= 60
                      ? "secondary"
                      : "default"
                  }
                >
                  {contract.daysUntilExpiration} días
                </Badge>
                <Badge
                  variant={
                    contract.status === "active"
                      ? "default"
                      : contract.status === "expired"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {contract.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
