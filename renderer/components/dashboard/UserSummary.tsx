import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User, Settings, Bell } from "lucide-react";
import { Button } from "../ui/button";

interface UserSummaryProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  stats: {
    contractsCreated: number;
    lastLogin: string;
    notifications: number;
  };
}

export function UserSummary({ user, stats }: UserSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mi Perfil</span>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.role}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.contractsCreated}</p>
            <p className="text-xs text-muted-foreground">Contratos Creados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.notifications}</p>
            <p className="text-xs text-muted-foreground">Notificaciones</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{stats.lastLogin}</p>
            <p className="text-xs text-muted-foreground">Último Acceso</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
