import { BaseController } from './BaseController.js';
import { ContractService } from '../services/ContractService.js';
import { ValidationService } from '../services/ValidationService.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import fs from 'fs';
import path from 'path';

export class ContractController extends BaseController {
  constructor() {
    const contractService = new ContractService();
    super(contractService);
    this.contractService = contractService;
    this.validationService = new ValidationService();
  }

  getAllContracts = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const filters = {
          ...req.query,
          userId: req.user.id,
          role: req.user.role,
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10
        };
        return await this.contractService.getAllContracts(filters);
      },
      { filters: req.query, userId: req.user.id }
    );
  };

  getContractById = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const contract = await this.contractService.getContractById(id, req.user.id, req.user.role);
        if (!contract) {
          throw new NotFoundError('Contrato no encontrado');
        }
        return contract;
      },
      { contractId: req.params.id, userId: req.user.id }
    );
  };

  // Método para descargar documento del contrato
  downloadContractDocument = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscar el contrato
      const contract = await this.contractService.getContractById(id, req.user.id, req.user.role);
      
      if (!contract) {
        throw new NotFoundError('Contrato no encontrado');
      }
      
      // Verificar si el contrato tiene un documento adjunto
      if (!contract.fileUrl) {
        throw new BadRequestError('El contrato no tiene un documento adjunto');
      }
      
      // Construir la ruta completa al archivo
      const filePath = path.resolve(contract.fileUrl);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new NotFoundError('El archivo no existe en el servidor');
      }
      
      // Obtener el nombre original del archivo desde la URL
      const fileName = path.basename(contract.fileUrl);
      
      // Determinar el tipo MIME basado en la extensión del archivo
      const ext = path.extname(fileName).toLowerCase();
      let contentType = 'application/octet-stream'; // Tipo por defecto
      
      switch (ext) {
        case '.pdf':
          contentType = 'application/pdf';
          break;
        case '.doc':
        case '.docx':
          contentType = 'application/msword';
          break;
        case '.xls':
        case '.xlsx':
          contentType = 'application/vnd.ms-excel';
          break;
        case '.txt':
          contentType = 'text/plain';
          break;
      }
      
      // Configurar los encabezados para la descarga
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Enviar el archivo como respuesta
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  };

  // Método para descargar documento del suplemento
  downloadSupplementDocument = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscar el suplemento
      const supplement = await this.contractService.getSupplementById(id, req.user.id, req.user.role);
      
      if (!supplement) {
        throw new NotFoundError('Suplemento no encontrado');
      }
      
      // Verificar si el suplemento tiene un documento adjunto
      if (!supplement.documentUrl) {
        throw new BadRequestError('El suplemento no tiene un documento adjunto');
      }
      
      // Construir la ruta completa al archivo
      const filePath = path.resolve(supplement.documentUrl);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new NotFoundError('El archivo no existe en el servidor');
      }
      
      // Obtener el nombre original del archivo desde la URL
      const fileName = path.basename(supplement.documentUrl);
      
      // Determinar el tipo MIME basado en la extensión del archivo
      const ext = path.extname(fileName).toLowerCase();
      let contentType = 'application/octet-stream'; // Tipo por defecto
      
      switch (ext) {
        case '.pdf':
          contentType = 'application/pdf';
          break;
        case '.doc':
        case '.docx':
          contentType = 'application/msword';
          break;
        case '.xls':
        case '.xlsx':
          contentType = 'application/vnd.ms-excel';
          break;
        case '.txt':
          contentType = 'text/plain';
          break;
      }
      
      // Configurar los encabezados para la descarga
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Enviar el archivo como respuesta
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  };

  createContract = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const validatedData = await this.validationService.validateContractData(req.body);
        return await this.contractService.createContract({
          ...validatedData,
          createdBy: req.user.id
        });
      },
      { userId: req.user.id, contractData: req.body }
    );
  };

  updateContract = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const validatedData = await this.validationService.validateContractUpdate(req.body);
        return await this.contractService.updateContract(id, validatedData, req.user.id, req.user.role);
      },
      { contractId: req.params.id, userId: req.user.id, updates: req.body }
    );
  };

  deleteContract = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        await this.contractService.deleteContract(id, req.user.id, req.user.role);
        return { message: 'Contrato eliminado exitosamente' };
      },
      { contractId: req.params.id, userId: req.user.id }
    );
  };

  searchContracts = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const searchParams = {
          ...req.query,
          userId: req.user.id,
          role: req.user.role
        };
        return await this.contractService.searchContracts(searchParams);
      },
      { searchParams: req.query, userId: req.user.id }
    );
  };

  changeContractStatus = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const { status, reason } = req.body;
        return await this.contractService.changeContractStatus(id, status, reason, req.user.id, req.user.role);
      },
      { contractId: req.params.id, userId: req.user.id, status: req.body.status }
    );
  };

  addTags = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const { tags } = req.body;
        return await this.contractService.addTags(id, tags, req.user.id, req.user.role);
      },
      { contractId: req.params.id, userId: req.user.id, tags: req.body.tags }
    );
  };

  removeTags = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const { tags } = req.body;
        return await this.contractService.removeTags(id, tags, req.user.id, req.user.role);
      },
      { contractId: req.params.id, userId: req.user.id, tags: req.body.tags }
    );
  };

  uploadDocument = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        if (!req.file) {
          throw new Error('Archivo requerido');
        }
        return await this.contractService.uploadDocument(id, req.file, req.user.id, req.user.role);
      },
      { contractId: req.params.id, userId: req.user.id, filename: req.file?.originalname }
    );
  };

  getContractStats = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const params = {
          ...req.query,
          userId: req.user.id,
          role: req.user.role
        };
        return await this.contractService.getContractStats(params);
      },
      { params: req.query, userId: req.user.id }
    );
  };

  /**
   * Obtener estadísticas de contratos por tipo
   */
  getContractStatsByType = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const result = await this.contractService.getContractStatsByType(req.user.id, req.user.role);
        return result;
      },
      { userId: req.user.id, role: req.user.role }
    );
  };

  getContractHistory = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        return await this.contractService.getContractHistory(id, req.user.id, req.user.role);
      },
      { contractId: req.params.id, userId: req.user.id }
    );
  };

  reviewContract = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const { status, comments } = req.body;
        const validatedData = await this.validationService.validateContractReview({ status, comments });
        return await this.contractService.reviewContract(id, validatedData, req.user.id);
      },
      { contractId: req.params.id, userId: req.user.id, reviewData: req.body }
    );
  };

  renewContract = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const validatedData = await this.validationService.validateContractRenewal(req.body);
        return await this.contractService.renewContract(id, validatedData, req.user.id);
      },
      { contractId: req.params.id, userId: req.user.id, renewalData: req.body }
    );
  };

  getContractSupplements = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        return await this.contractService.getContractSupplements(id, req.user.id, req.user.role);
      },
      { contractId: req.params.id, userId: req.user.id }
    );
  };

  getSupplementById = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        return await this.contractService.getSupplementById(id, req.user.id, req.user.role);
      },
      { supplementId: req.params.id, userId: req.user.id }
    );
  };

  createSupplement = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params; // ID del contrato
        const fileData = req.file ? {
          fileUrl: req.file.path,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileMimeType: req.file.mimetype
        } : null;
        
        // Parsear datos del cuerpo si se envían como string JSON
        let supplementData = req.body;
        if (req.body.data && typeof req.body.data === 'string') {
          try {
            supplementData = JSON.parse(req.body.data);
          } catch (error) {
            throw new Error('Formato de datos inválido');
          }
        }
        
        return await this.contractService.createSupplement(
          id, 
          { ...supplementData, fileData }, 
          req.user.id,
          req.user.role
        );
      },
      { contractId: req.params.id, userId: req.user.id }
    );
  };
  
  updateSupplement = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params; // ID del suplemento
        const fileData = req.file ? {
          fileUrl: req.file.path,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileMimeType: req.file.mimetype
        } : null;
        
        // Parsear datos del cuerpo si se envían como string JSON
        let supplementData = req.body;
        if (req.body.data && typeof req.body.data === 'string') {
          try {
            supplementData = JSON.parse(req.body.data);
          } catch (error) {
            throw new Error('Formato de datos inválido');
          }
        }
        
        return await this.contractService.updateSupplement(
          id,
          { ...supplementData, fileData },
          req.user.id,
          req.user.role
        );
      },
      { supplementId: req.params.id, userId: req.user.id }
    );
  };
  
  deleteSupplement = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params; // ID del suplemento
        await this.contractService.deleteSupplement(id, req.user.id, req.user.role);
        return { message: 'Suplemento eliminado exitosamente' };
      },
      { supplementId: req.params.id, userId: req.user.id }
    );
  };
}

export default new ContractController();
