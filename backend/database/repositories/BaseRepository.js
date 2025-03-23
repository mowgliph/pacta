import { Op } from 'sequelize';

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return this.model.findAll({
      ...options,
      where: {
        ...options.where,
        deletedAt: null
      }
    });
  }

  async findById(id, options = {}) {
    return this.model.findOne({
      ...options,
      where: {
        id,
        deletedAt: null,
        ...options.where
      }
    });
  }

  async create(data, options = {}) {
    return this.model.create(data, options);
  }

  async update(id, data, options = {}) {
    const [updated] = await this.model.update(data, {
      where: {
        id,
        deletedAt: null
      },
      ...options
    });
    return updated;
  }

  async delete(id, options = {}) {
    return this.model.update(
      { deletedAt: new Date() },
      {
        where: {
          id,
          deletedAt: null
        },
        ...options
      }
    );
  }

  async findOne(options = {}) {
    return this.model.findOne({
      ...options,
      where: {
        ...options.where,
        deletedAt: null
      }
    });
  }

  async count(options = {}) {
    return this.model.count({
      ...options,
      where: {
        ...options.where,
        deletedAt: null
      }
    });
  }

  async bulkCreate(data, options = {}) {
    return this.model.bulkCreate(data, options);
  }

  async bulkUpdate(data, options = {}) {
    return this.model.bulkCreate(data, {
      ...options,
      updateOnDuplicate: true
    });
  }

  async findOrCreate(where, defaults = {}, options = {}) {
    return this.model.findOrCreate({
      where: {
        ...where,
        deletedAt: null
      },
      defaults,
      ...options
    });
  }

  async paginate(page = 1, limit = 10, options = {}) {
    const offset = (page - 1) * limit;
    const { count, rows } = await this.model.findAndCountAll({
      ...options,
      where: {
        ...options.where,
        deletedAt: null
      },
      limit,
      offset
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }
} 