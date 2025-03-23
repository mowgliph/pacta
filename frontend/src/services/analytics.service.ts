import api from './api';

/**
 * Interfaces para los tipos de datos utilizados en el módulo de Analytics
 */
export interface AnalyticsMetric {
  title: string;
  value: string;
  change: number;
  icon: string;
  colorClass: string;
}

export interface EfficiencyStat {
  label: string;
  value: string;
  trend: 'up' | 'down';
  percentage: number;
}

export interface ComplianceStat {
  label: string;
  value: string;
  trend: 'up' | 'down';
  percentage: number;
}

export interface PredictionData {
  title: string;
  value: string;
  change: number;
  isPositive: boolean;
}

export interface ContractDistribution {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Tipo de respuesta para la llamada al backend del módulo de Analytics
 */
export interface AnalyticsResponse {
  metrics: AnalyticsMetric[];
  efficiency: EfficiencyStat[];
  compliance: ComplianceStat[];
  predictions: PredictionData[];
  distribution: ContractDistribution[];
  trends: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
}

class AnalyticsService {
  /**
   * Obtiene los datos completos de Analytics para un período específico
   * @param days Número de días para filtrar los datos
   * @param preset Tipo de vista preestablecida (mensual, trimestral, anual)
   * @returns Datos analíticos completos
   */
  async getAnalyticsData(days: number = 30, preset: string = 'monthly'): Promise<AnalyticsResponse> {
    try {
      const response = await api.get<AnalyticsResponse>(`/analytics?days=${days}&preset=${preset}`);
      console.log('Analytics data loaded successfully for period:', days, 'days');
      return response.data;
    } catch (error: any) {
      let errorMessage = 'Error al obtener los datos de analytics';
      if (error.response) {
        console.error('Server error:', error.response.status, error.response.data);
        errorMessage = `Error del servidor: ${error.response.status} - ${error.response.data.message || 'Error desconocido'}`;
      } else if (error.request) {
        console.error('No response from server:', error.request);
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a Internet.';
      } else {
        console.error('Request setup error:', error.message);
        errorMessage = `Error en la solicitud: ${error.message}`;
      }
      
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Obtiene datos específicos para un tipo de análisis particular
   * @param analysisType Tipo específico de análisis a cargar
   * @param options Opciones adicionales para el análisis
   * @returns Datos específicos para el tipo de análisis solicitado
   */
  async getSpecificAnalysis(analysisType: string, options: Record<string, any> = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      const response = await api.get(`/analytics/${analysisType}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching specific analysis data for ${analysisType}:`, error);
      throw error;
    }
  }
  
  /**
   * Genera un informe exportable en diferentes formatos
   * @param format Formato del reporte (pdf, excel, csv)
   * @param filters Filtros a aplicar al reporte
   * @returns URL de descarga del reporte
   */
  async generateReport(format: 'pdf' | 'excel' | 'csv', filters: Record<string, any> = {}): Promise<string> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      const response = await api.get(`/analytics/report/${format}?${queryParams.toString()}`);
      return response.data.reportUrl;
    } catch (error) {
      console.error(`Error generating ${format} report:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene datos históricos para un período específico con granularidad personalizada
   * @param dataType Tipo de datos históricos (contratos, valor, riesgo, etc.)
   * @param granularity Granularidad de los datos (día, semana, mes, trimestre, año)
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param options Opciones adicionales para personalizar la consulta
   * @returns Datos históricos formateados para gráficos
   */
  async getHistoricalData(
    dataType: string,
    granularity: 'day' | 'week' | 'month' | 'quarter' | 'year',
    startDate: Date,
    endDate: Date,
    options: Record<string, any> = {}
  ): Promise<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('dataType', dataType);
      queryParams.append('granularity', granularity);
      queryParams.append('startDate', startDate.toISOString());
      queryParams.append('endDate', endDate.toISOString());
      
      Object.entries(options).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      const response = await api.get(`/analytics/historical?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching historical data for ${dataType}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene la lista de contratos en riesgo para la tabla de analíticas
   * @returns Lista de contratos en riesgo
   */
  async getRiskContracts(): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      name: string;
      category: string;
      riskLevel: string;
      endDate: string;
      status: string;
    }>;
  }> {
    try {
      const response = await api.get('/analytics/risk-contracts');
      return response.data;
    } catch (error) {
      console.error('Error fetching risk contracts:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService(); 