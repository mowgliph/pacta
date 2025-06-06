/**
 * Módulo de consultas SQL para la aplicación PACTA
 * Contiene todas las consultas SQL utilizadas en la aplicación
 */

// Consultas de estadísticas
exports.STATISTICS_QUERIES = {
  // Obtiene contratos creados por mes
  // Optimización: Usa strftime para SQLite
  GET_CONTRACTS_BY_MONTH: `
    SELECT 
      strftime('%Y-%m', datetime(createdAt/1000, 'unixepoch')) as month, 
      COUNT(*) as count 
    FROM Contract 
    WHERE isArchived = false
      AND createdAt IS NOT NULL
    GROUP BY strftime('%Y-%m', datetime(createdAt/1000, 'unixepoch'))
    ORDER BY month ASC
  `,

  // Obtiene contratos vencidos por mes
  // Optimización: Usa strftime para SQLite y filtro de índice
  GET_EXPIRED_CONTRACTS_BY_MONTH: `
    SELECT 
      strftime('%Y-%m', datetime(endDate/1000, 'unixepoch')) as month, 
      COUNT(*) as count 
    FROM Contract 
    WHERE status = 'VENCIDO' 
      AND isArchived = false
      AND endDate IS NOT NULL
    GROUP BY strftime('%Y-%m', datetime(endDate/1000, 'unixepoch'))
    ORDER BY month ASC
  `,

  // Obtiene suplementos por contrato
  // Optimización: Usa INNER JOIN y selección de columnas específicas
  GET_SUPPLEMENTS_BY_CONTRACT: `
    SELECT 
      s.contractId,
      c.contractNumber,
      c.companyName,
      COUNT(s.id) as supplementCount
    FROM Supplement s
    INNER JOIN (
      SELECT id, contractNumber, companyName 
      FROM Contract 
      WHERE isArchived = false
    ) c ON s.contractId = c.id
    GROUP BY s.contractId, c.contractNumber, c.companyName
    ORDER BY supplementCount DESC
  `,

  // Obtiene actividad de usuarios
  GET_USERS_ACTIVITY: (limit, offset) => `
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(hr.id) as activityCount,
      MAX(hr.createdAt) as lastActivity
    FROM User u
    JOIN HistoryRecord hr ON u.id = hr.userId
    GROUP BY u.id, u.name, u.email
    ORDER BY activityCount DESC
    LIMIT ${limit} OFFSET ${offset}
  `,

  // Obtiene distribución de contratos por estado
  GET_CONTRACTS_BY_STATUS: `
    SELECT 
      status, 
      COUNT(*) as count
    FROM Contract
    WHERE isArchived = false
    GROUP BY status
    ORDER BY count DESC
  `,

  // Obtiene distribución de contratos por tipo
  GET_CONTRACTS_BY_TYPE: `
    SELECT 
      type, 
      COUNT(*) as count
    FROM Contract
    WHERE isArchived = false
    GROUP BY type
    ORDER BY count DESC
  `,

  // Obtiene distribución de contratos por usuario
  GET_CONTRACTS_BY_USER: `
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(c.id) as contractCount
    FROM User u
    LEFT JOIN Contract c ON u.id = c.ownerId
    WHERE c.isArchived = false OR c.isArchived IS NULL
    GROUP BY u.id, u.name, u.email
    ORDER BY contractCount DESC
  `
};

// Consultas para el dashboard
exports.DASHBOARD_QUERIES = {
  // Obtiene estadísticas generales del dashboard
  GET_DASHBOARD_STATS: `
    SELECT 
      CAST(COUNT(*) AS INTEGER) as total,
      CAST(SUM(CASE WHEN status = 'ACTIVO' THEN 1 ELSE 0 END) AS INTEGER) as active,
      CAST(SUM(CASE WHEN status = 'VENCIDO' THEN 1 ELSE 0 END) AS INTEGER) as expired,
      CAST(SUM(CASE WHEN type = 'Cliente' AND status = 'ACTIVO' THEN 1 ELSE 0 END) AS INTEGER) as client,
      CAST(SUM(CASE WHEN type = 'Proveedor' AND status = 'ACTIVO' THEN 1 ELSE 0 END) AS INTEGER) as supplier,
      CAST(SUM(CASE 
            WHEN status = 'ACTIVO' AND 
                 endDate IS NOT NULL AND
                 datetime(endDate/1000, 'unixepoch') >= ? AND 
                 datetime(endDate/1000, 'unixepoch') <= ? 
            THEN 1 
            ELSE 0 
          END) AS INTEGER) as expiring
    FROM Contract
    WHERE isArchived = false
    AND (status IS NOT NULL AND status != '')
  `,
  
  // Obtiene actividad reciente
  // Optimización: Usa índices compuestos y selección de columnas específicas
  GET_RECENT_ACTIVITY: `
    SELECT 
      c.id,
      c.contractNumber,
      c.companyName,
      c.type,
      c.status,
      datetime(c.updatedAt/1000, 'unixepoch') as updatedAt,
      u.name as createdByName
    FROM (
      SELECT id, contractNumber, companyName, type, status, updatedAt, createdById
      FROM Contract 
      WHERE isArchived = false
      ORDER BY updatedAt DESC
      LIMIT 10
    ) c
    JOIN User u ON c.createdById = u.id
    ORDER BY c.updatedAt DESC
  `
};

// Consultas para estadísticas del dashboard del mes anterior
exports.LAST_MONTH_QUERIES = {
  // Obtiene clientes activos al final del mes anterior
  GET_ACTIVE_CLIENTS_LAST_MONTH: (lastDayOfLastMonth) => ({
    query: `
      SELECT COUNT(*) as count
      FROM Contract
      WHERE type = 'Cliente'
        AND isArchived = false
        AND createdAt <= ?
    `,
    params: [lastDayOfLastMonth]
  }),

  // Obtiene proveedores activos al final del mes anterior
  GET_ACTIVE_SUPPLIERS_LAST_MONTH: (lastDayOfLastMonth) => ({
    query: `
      SELECT COUNT(*) as count
      FROM Contract
      WHERE type = 'Proveedor'
        AND isArchived = false
        AND createdAt <= ?
    `,
    params: [lastDayOfLastMonth]
  }),

  // Obtiene contratos activos al final del mes anterior
  GET_ACTIVE_CONTRACTS_LAST_MONTH: (lastDayOfLastMonth) => ({
    query: `
      SELECT COUNT(*) as count
      FROM Contract
      WHERE status = 'ACTIVO'
        AND isArchived = false
        AND createdAt <= ?
        AND endDate >= ?
    `,
    params: [lastDayOfLastMonth, lastDayOfLastMonth]
  }),

  // Obtiene contratos que vencieron durante el mes anterior
  GET_EXPIRING_LAST_MONTH: (firstDayOfLastMonth, lastDayOfLastMonth) => ({
    query: `
      SELECT COUNT(*) as count
      FROM Contract
      WHERE status = 'ACTIVO'
        AND isArchived = false
        AND endDate BETWEEN ? AND ?
    `,
    params: [firstDayOfLastMonth, lastDayOfLastMonth]
  }),

  // Obtiene contratos expirados al final del mes anterior
  GET_EXPIRED_LAST_MONTH: (lastDayOfLastMonth) => ({
    query: `
      SELECT COUNT(*) as count
      FROM Contract
      WHERE status = 'VENCIDO'
        AND isArchived = false
        AND createdAt <= ?
    `,
    params: [lastDayOfLastMonth]
  })
};

// Consultas para estadísticas de contratos
exports.STATS_QUERIES = {
  // Obtiene estadísticas de contratos por estado
  GET_CONTRACTS_BY_STATUS: (filters = {}) => {
    let whereClause = 'WHERE isArchived = false';
    const params = [];
    
    if (filters && Object.keys(filters).length > 0) {
      const filterConditions = [];
      Object.entries(filters).forEach(([key, value]) => {
        filterConditions.push(`${key} = ?`);
        params.push(value);
      });
      whereClause += ` AND ${filterConditions.join(' AND ')}`;
    }
    
    return {
      query: `
        SELECT 
          status, 
          COUNT(*) as count
        FROM Contract
        ${whereClause}
        GROUP BY status
        ORDER BY count DESC
      `,
      params
    };
  },

  // Obtiene estadísticas de contratos por tipo
  GET_CONTRACTS_BY_TYPE: (filters = {}) => {
    let whereClause = 'WHERE isArchived = false';
    const params = [];
    
    if (filters && Object.keys(filters).length > 0) {
      const filterConditions = [];
      Object.entries(filters).forEach(([key, value]) => {
        filterConditions.push(`${key} = ?`);
        params.push(value);
      });
      whereClause += ` AND ${filterConditions.join(' AND ')}`;
    }
    
    return {
      query: `
        SELECT 
          type, 
          COUNT(*) as count
        FROM Contract
        ${whereClause}
        GROUP BY type
        ORDER BY count DESC
      `,
      params
    };
  },

  // Obtiene estadísticas de contratos por mes de creación
  GET_CONTRACTS_BY_MONTH: (filters = {}) => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setUTCMonth(twelveMonthsAgo.getUTCMonth() - 12);
    twelveMonthsAgo.setUTCHours(0, 0, 0, 0);
    
    let whereClause = 'WHERE isArchived = false AND createdAt >= ?';
    const params = [twelveMonthsAgo];
    
    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        whereClause += ` AND ${key} = ?`;
        params.push(value);
      });
    }
    
    return {
      query: `
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as count
        FROM Contract
        ${whereClause}
        GROUP BY month
        ORDER BY month ASC
      `,
      params
    };
  }
};

// Consultas para contratos
exports.CONTRACT_QUERIES = {
  // Obtiene contratos próximos a vencer
  GET_EXPIRING_CONTRACTS: (limit, offset) => `
    SELECT 
      id, 
      contractNumber, 
      endDate,
      companyName,
      startDate
    FROM Contract
    WHERE endDate BETWEEN ? AND ?
      AND status = 'ACTIVO'
      AND isArchived = false
    ORDER BY endDate ASC
    LIMIT ${limit} OFFSET ${offset}
  `,

  // Cuenta contratos próximos a vencer
  COUNT_EXPIRING_CONTRACTS: `
    SELECT COUNT(*) as total
    FROM Contract
    WHERE endDate BETWEEN ? AND ?
      AND status = 'ACTIVO'
      AND isArchived = false
  `,

  // Obtiene contratos sin documentos
  GET_CONTRACTS_WITHOUT_DOCS: (limit, offset) => `
    SELECT 
      id, 
      contractNumber,
      companyName,
      createdAt
    FROM Contract c
    WHERE NOT EXISTS (
      SELECT 1 FROM Document d WHERE d.contractId = c.id
    )
    AND isArchived = false
    ORDER BY createdAt DESC
    LIMIT ${limit} OFFSET ${offset}
  `,

  // Cuenta contratos sin documentos
  COUNT_CONTRACTS_WITHOUT_DOCS: `
    SELECT COUNT(*) as total
    FROM Contract c
    WHERE NOT EXISTS (
      SELECT 1 FROM Document d WHERE d.contractId = c.id
    )
    AND isArchived = false
  `
};
