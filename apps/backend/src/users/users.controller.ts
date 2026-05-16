import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { SanitizationPipe } from '../common/pipes/sanitization.pipe';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: ExpressRequest & { user: JwtPayload }) {
    const userId = Number(id);
    const currentUserId = req.user.userId;
    const currentUserRol = req.user.rol;

    if (currentUserId !== userId && currentUserRol !== UserRole.ADMIN) {
      throw new ForbiddenException('No tienes permiso para ver este perfil');
    }

    return this.usersService.findOneById(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new SanitizationPipe()) updateData: UpdateUserDto,
    @Request() req: ExpressRequest & { user: JwtPayload },
  ) {
    const userId = Number(id);
    return this.usersService.update(userId, updateData, req.user.userId, req.user.rol);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.usersService.delete(Number(id));
  }
}