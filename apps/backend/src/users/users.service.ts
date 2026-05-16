import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

/**
 * Servicio encargado de gestionar las operaciones CRUD y lógica de negocio
 * relacionada con los usuarios del sistema.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param userData Datos del usuario a crear.
   * @returns El usuario creado.
   */
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return await this.usersRepository.save(newUser);
  }

  /**
   * Busca un usuario por su dirección de correo electrónico.
   * @param email Email del usuario a buscar.
   * @returns El usuario encontrado o null si no existe.
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Busca un usuario por su ID único.
   * @param id ID del usuario.
   * @returns El usuario encontrado.
   * @throws NotFoundException si el usuario no existe.
   */
  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  /**
   * Obtiene una lista de todos los usuarios (solo campos básicos).
   * @returns Array de usuarios.
   */
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      select: ['id', 'nombre', 'apellido', 'email', 'rol'],
    });
  }

  /**
   * Actualiza los datos de un usuario.
   * @param id ID del usuario a actualizar.
   * @param updateData Datos a modificar.
   * @param currentUserId ID del usuario que realiza la petición.
   * @param currentUserRol Rol del usuario que realiza la petición.
   * @returns El usuario actualizado.
   * @throws ForbiddenException si el usuario no tiene permisos para actualizar.
   */
  async update(id: number, updateData: Partial<User>, currentUserId: number, currentUserRol: UserRole): Promise<User> {
    const user = await this.findOneById(id);

    if (currentUserId !== id && currentUserRol !== UserRole.ADMIN) {
      throw new ForbiddenException('No tienes permiso para actualizar este usuario');
    }

    if (updateData.password) {
      delete updateData.password;
    }
    if (updateData.rol && currentUserRol !== UserRole.ADMIN) {
      delete updateData.rol;
    }

    Object.assign(user, updateData);
    return await this.usersRepository.save(user);
  }

  /**
   * Elimina un usuario de la base de datos.
   * @param id ID del usuario a eliminar.
   */
  async delete(id: number): Promise<void> {
    const user = await this.findOneById(id);
    await this.usersRepository.remove(user);
  }
}