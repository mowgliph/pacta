"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useContracts } from "../../hooks/useContracts"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import { LoadingSpinner } from "../ui/loading-spinner"
import { Search, FileText } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "../ui/badge"
import { useDebounce } from "../../hooks/useDebounce"

export function ContractSearch() {
  const router = useRouter()
  const { searchContracts } = useContracts()
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    const search = async () => {
      if (debouncedSearchTerm.trim().length < 3) {
        setResults([])
        return
      }

      setIsSearching(true)
      try {
        const searchResults = await searchContracts(debouncedSearchTerm)
        setResults(searchResults)
      } catch (error) {
        console.error("Error searching contracts:", error)
      } finally {
        setIsSearching(false)
      }
    }

    search()
  }, [debouncedSearchTerm, searchContracts])

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Borrador</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expirado</Badge>
      case "terminated":
        return <Badge className="bg-red-100 text-red-800">Terminado</Badge>
      case "archived":
        return <Badge className="bg-blue-100 text-blue-800">Archivado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy")
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar contratos, suplementos, documentos..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isSearching && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      )}

      {!isSearching && searchTerm.trim().length >= 3 && results.length === 0 && (
        <div className="text-center py-4 text-gray-500">No se encontraron resultados para "{searchTerm}"</div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((contract) => (
            <Card
              key={contract.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/contracts/${contract.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-3 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-medium">{contract.title}</h3>
                      <p className="text-sm text-gray-500">{contract.contractNumber}</p>
                      {contract.description && <p className="text-sm mt-1 line-clamp-1">{contract.description}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusBadge(contract.status)}
                    <span className="text-xs text-gray-500 mt-1">{formatDate(contract.startDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
