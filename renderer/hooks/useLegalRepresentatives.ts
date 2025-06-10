import { useState, useCallback } from 'react';
import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type QueryFunctionContext,
  type QueryKey
} from '@tanstack/react-query';
import { LegalRepresentativeValues } from '@/schemas/contract.schema';
import { useToast } from '@/components/ui/use-toast';

interface LegalRepresentativeListResponse {
  items: LegalRepresentativeValues[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Hook personalizado para manejar operaciones relacionadas con representantes legales
 * Proporciona funciones para crear, actualizar, buscar y listar representantes legales
 */
export const useLegalRepresentatives = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // Obtener la lista de representantes legales
  const fetchLegalRepresentatives = useCallback(
    async (context: QueryFunctionContext<QueryKey>): Promise<LegalRepresentativeListResponse> => {
      const [_key, { search = '', page = 1, limit = 10 }] = context.queryKey as [string, { search?: string; page?: number; limit?: number }];
            
      try {
        const response = await window.electron.ipcRenderer.invoke(
          'legal-representatives:list',
          { search, page, limit }
        ) as ApiResponse<LegalRepresentativeListResponse>;
        
        if (!response.success) {
          throw new Error(response.error || 'Error al cargar los representantes legales');
        }
        
        return response.data!;
      } catch (err) {
        console.error('Error al cargar representantes legales:', err);
        throw err;
      }
    },
    []
  );

  // Obtener un representante legal por ID
  const fetchLegalRepresentativeById = useCallback(
    async (id: string): Promise<LegalRepresentativeValues> => {
      try {
        const response = await window.electron.ipcRenderer.invoke(
          'legal-representatives:get',
          id
        ) as ApiResponse<LegalRepresentativeValues>;
        
        if (!response.success) {
          throw new Error(response.error || 'Error al cargar el representante legal');
        }
        
        return response.data!;
      } catch (err) {
        console.error('Error al cargar el representante legal:', err);
        throw err;
      }
    },
    []
  );

  // Mutación para crear un nuevo representante legal
  const createLegalRepresentativeMutation = useMutation({
    mutationFn: async (data: Omit<LegalRepresentativeValues, 'id'>) => {
      try {
        const response = await window.electron.ipcRenderer.invoke(
          'legal-representatives:create',
          data
        ) as ApiResponse<LegalRepresentativeValues>;
        
        if (!response.success) {
          throw new Error(response.error || 'Error al crear el representante legal');
        }
        
        return response.data!;
      } catch (err) {
        console.error('Error al crear representante legal:', err);
        throw err;
      }
    },
    onSuccess: () => {
      // Invalidar la consulta de lista para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['legalRepresentatives'] });
      toast({
        title: 'Éxito',
        description: 'Representante legal creado exitosamente',
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Mutación para actualizar un representante legal existente
  const updateLegalRepresentativeMutation = useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: Partial<LegalRepresentativeValues> 
    }): Promise<LegalRepresentativeValues> => {
      try {
        const response = await window.electron.ipcRenderer.invoke(
          'legal-representatives:update',
          { id, data }
        ) as ApiResponse<LegalRepresentativeValues>;
        
        if (!response.success) {
          throw new Error(response.error || 'Error al actualizar el representante legal');
        }
        
        return response.data!;
      } catch (err) {
        console.error('Error al actualizar representante legal:', err);
        throw err;
      }
    },
    onSuccess: () => {
      // Invalidar las consultas relevantes
      queryClient.invalidateQueries({ queryKey: ['legalRepresentatives'] });
      toast({
        title: 'Éxito',
        description: 'Representante legal actualizado exitosamente',
        variant: 'success'
      });
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Función para buscar representantes legales por término de búsqueda
  const searchLegalRepresentatives = useCallback(async (searchTerm: string): Promise<LegalRepresentativeValues[]> => {
    try {
      const response = await window.electron.ipcRenderer.invoke(
        'legal-representatives:search',
        { search: searchTerm, limit: 10 }
      ) as ApiResponse<{ items: LegalRepresentativeValues[] }>;
      
      if (!response.success) {
        throw new Error(response.error || 'Error al buscar representantes legales');
      }
      
      return response.data?.items || [];
    } catch (err) {
      console.error('Error al buscar representantes legales:', err);
      throw err;
    }
  }, []);

  // Hook para obtener la lista de representantes legales
  const useLegalRepresentativesList = (options: { 
    search?: string; 
    page?: number; 
    limit?: number;
    enabled?: boolean;
  } = {}) => {
    const { search = '', page = 1, limit = 10, enabled = true } = options;
    
    return useQuery<LegalRepresentativeListResponse, Error>({
      queryKey: ['legalRepresentatives', { search, page, limit }],
      queryFn: fetchLegalRepresentatives as any, // Usamos 'as any' temporalmente para evitar errores de tipo
      enabled,
      placeholderData: (previousData) => previousData, // Equivalente a keepPreviousData en v4
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 15 * 60 * 1000, // 15 minutos (nuevo nombre para cacheTime en v5+)
    });
  };

  // Hook para obtener un representante legal por ID
  const useLegalRepresentative = (id?: string) => {
    return useQuery<LegalRepresentativeValues | null, Error>({
      queryKey: ['legalRepresentative', id] as const,
      queryFn: () => id ? fetchLegalRepresentativeById(id) : Promise.resolve(null),
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  return {
    // Consultas
    useLegalRepresentativesList,
    useLegalRepresentative,
    
    // Mutaciones
    createLegalRepresentative: createLegalRepresentativeMutation.mutateAsync,
    updateLegalRepresentative: updateLegalRepresentativeMutation.mutateAsync,
    
    // Funciones de utilidad
    searchLegalRepresentatives,
    
    // Estados de carga y error
    isLoading: createLegalRepresentativeMutation.isPending || updateLegalRepresentativeMutation.isPending,
    isError: createLegalRepresentativeMutation.isError || updateLegalRepresentativeMutation.isError,
    error,
  };
};

export default useLegalRepresentatives;
