"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/router"

interface User {
  id: string
  name: string
  role: string
  avatar?: string
}

interface UserSummaryProps {
  users: User[]
}

export function UserSummary({ users }: UserSummaryProps) {
  const router = useRouter()

  return (
    <Card className="dashboard-card">
      <CardHeader className="dashboard-card-header">
        <CardTitle className="dashboard-card-title">Usuarios Activos</CardTitle>
      </CardHeader>
      <CardContent className="dashboard-card-content p-0">
        <div className="divide-y divide-gray-100">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-primary-600 text-primary-900">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-primary-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400"
                onClick={() => router.push(`/admin/users/${user.id}`)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
