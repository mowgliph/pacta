// Definir canales IPC para comunicación con el proceso principal
export const StatisticsChannels = {
  GET_STATISTICS: "statistics:get",
  GET_CONTRACT_TYPES: "statistics:getContractTypes",
  GET_TIME_SERIES: "statistics:getTimeSeries",
  EXPORT_STATISTICS: "statistics:export",
};

// Servicios de API para estadísticas
export const statisticsApi = {
  /**
   * Obtener estadísticas generales
   */
  getStatistics: async (params = {}) => {
    return window.Electron.ipcRenderer.invoke(StatisticsChannels.GET_STATISTICS, params);
  },

  /**
   * Obtener distribución por tipo de contrato
   */
  getContractTypeDistribution: async () => {
    return window.Electron.ipcRenderer.invoke(StatisticsChannels.GET_CONTRACT_TYPES);
  },

  /**
   * Obtener series temporales para gráficos
   */
  getTimeSeriesData: async (params) => {
    return window.Electron.ipcRenderer.invoke(StatisticsChannels.GET_TIME_SERIES, params);
  },

  /**
   * Exportar estadísticas a CSV/Excel
   */
  exportStatistics: async (format = 'csv', filters = {}) => {
    return window.Electron.ipcRenderer.invoke(StatisticsChannels.EXPORT_STATISTICS, {
      format,
      filters
    });
  }
}; 