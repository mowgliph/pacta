import { BaseController } from './BaseController.js';
import { ContractService } from '../../services/ContractService.js';
import { ValidationService } from '../../services/ValidationService.js';
import { NotFoundError } from '../../utils/errors.js';

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
}

export default new ContractController();
