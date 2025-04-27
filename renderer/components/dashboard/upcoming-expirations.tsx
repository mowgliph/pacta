"use client"

import { useRouter } from "next/router"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { AlertOctagon, Clock, ArrowUpRight, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import type { Contract } from "../../types"

interface UpcomingExpirationsProps {
  contracts: Contract[]
}

export function UpcomingExpirations({ contracts }: UpcomingExpirationsProps) {
  const router = useRouter()

  const getDaysRemaining = (date: string | Date) => {
    const endDate = typeof date === 'string' ? new Date(date) : date
    return differenceInDays(endDate, new Date())
  }

  const getSeverityClass = (days: number) => {
    if (days <= 7) {
      return "text-red-600 bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30"
    } else if (days <= 14) {
      return "text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30"
    } else {
      return "text-yellow-600 bg-yellow-50 border-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-900/30"
    }
  }

  const getStatusIcon = (days: number) => {
    if (days <= 7) {
      return <AlertOctagon className="h-4 w-4 text-red-600" />
    } else if (days <= 14) {
      return <Clock className="h-4 w-4 text-orange-600" />
    } else {
      return <Calendar className="h-4 w-4 text-yellow-600" />
    }
  }

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <Card className="shadow-sm border">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold">Próximos Vencimientos</CardTitle>
              <CardDescription>Contratos que expirarán pronto</CardDescription>
            </div>
            {contracts.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/contracts?filter=expiring')}
                className="text-xs"
              >
                Ver todos
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="mx-auto h-10 w-10 mb-2 text-gray-400" />
              <p>No hay contratos próximos a vencer</p>
            </div>
          ) : (
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
            >
              {contracts.slice(0, 5).map((contract) => {
                const daysLeft = getDaysRemaining(contract.endDate)
                const severityClass = getSeverityClass(daysLeft)
                const statusIcon = getStatusIcon(daysLeft)
                const formattedDate = format(
                  new Date(contract.endDate),
                  "dd 'de' MMMM 'de' yyyy",
                  { locale: es }
                )
                
                return (
                  <motion.div 
                    key={contract.id}
                    variants={itemVariants}
                    className="relative"
                  >
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${severityClass} hover:bg-opacity-80 transition-all`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {statusIcon}
                          <h4 className="font-medium text-sm truncate">{contract.title}</h4>
                        </div>
                        <div className="text-xs opacity-80 flex items-center">
                          <Calendar className="h-3 w-3 mr-1 inline" /> 
                          {formattedDate}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={`font-mono text-xs whitespace-nowrap ${daysLeft <= 7 ? 'animate-pulse' : ''}`}
                        >
                          {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full"
                          onClick={() => router.push(`/contracts/${contract.id}`)}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
