const bcrypt = require("bcryptjs")

class UserService {
  constructor(prisma) {
    this.prisma = prisma
  }

  /**
   * Obtener todos los usuarios
   * @returns {Promise<Array>} Lista de usuarios
   */
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        lastLogin: true,
        role: {
          select: {
            id: true,
            name: true,
          }
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc'
      }
    })
  }

  /**
   * Obtener un usuario por su ID
   * @param {string} id - ID del usuario
   * @returns {Promise<object>} Datos del usuario
   */
  async getUserById(id) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
          }
        },
        isActive: true,
        customPermissions: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      throw new Error("Usuario no encontrado")
    }

    return user
  }

  /**
   * Crear un nuevo usuario
   * @param {object} userData - Datos del usuario a crear
   * @returns {Promise<object>} Usuario creado
   */
  async createUser({ name, email, password, roleId, isActive = true }) {
    // Verificar si ya existe un usuario con ese email
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error("Ya existe un usuario con ese correo electrónico")
    }

    // Verificar si el rol existe
    const role = await this.prisma.role.findUnique({
      where: { id: roleId }
    })

    if (!role) {
      throw new Error("Rol no encontrado")
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Crear nuevo usuario
    return this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
        isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        role: {
          select: {
            id: true,
            name: true,
          }
        },
        createdAt: true,
      }
    })
  }

  /**
   * Actualizar un usuario existente
   * @param {string} id - ID del usuario a actualizar
   * @param {object} updateData - Datos a actualizar
   * @returns {Promise<object>} Usuario actualizado
   */
  async updateUser(id, { name, email, roleId, isActive, customPermissions }) {
    // Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new Error("Usuario no encontrado")
    }

    // Si se va a actualizar el email, verificar que no esté en uso
    if (email && email !== user.email) {
      const existingUserWithEmail = await this.prisma.user.findUnique({
        where: { email }
      })

      if (existingUserWithEmail) {
        throw new Error("El correo electrónico ya está en uso")
      }
    }

    // Si se actualiza el rol, verificar que exista
    if (roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId }
      })

      if (!role) {
        throw new Error("Rol no encontrado")
      }
    }

    // Construir objeto con datos a actualizar
    const updateData = {}
    
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (roleId) updateData.roleId = roleId
    if (isActive !== undefined) updateData.isActive = isActive
    if (customPermissions) updateData.customPermissions = customPermissions

    // Actualizar usuario
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        role: {
          select: {
            id: true,
            name: true,
          }
        },
        customPermissions: true,
        updatedAt: true,
      }
    })
  }

  /**
   * Cambiar la contraseña de un usuario (por un administrador)
   * @param {string} id - ID del usuario
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<boolean>}
   */
  async resetPassword(id, newPassword) {
    // Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new Error("Usuario no encontrado")
    }

    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Actualizar contraseña
    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      }
    })

    return true
  }

  /**
   * Eliminar o desactivar un usuario
   * @param {string} id - ID del usuario
   * @param {boolean} hardDelete - Indica si se debe eliminar permanentemente
   * @returns {Promise<boolean>}
   */
  async deleteUser(id, hardDelete = false) {
    // Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new Error("Usuario no encontrado")
    }

    if (hardDelete) {
      // Eliminar permanentemente (solo en entornos de desarrollo)
      await this.prisma.user.delete({
        where: { id }
      })
    } else {
      // Desactivar usuario (forma recomendada)
      await this.prisma.user.update({
        where: { id },
        data: {
          isActive: false
        }
      })
    }

    return true
  }
}

module.exports = UserService 