//para el exigente que vaya a querer proteger una ruta, aqui le dejo el ejemplo

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('jobs')
export class JobsController {
  
  @UseGuards(AuthGuard('jwt')) // Solo accesible con un Token válido
  @Get()
  findAll() {
    return "Esta lista es privada";
  }
}
//solo tienes que hacer uso de @UseGuards(AuthGuard('jwt')) en cualquier ruta que quieras proteger, y listo, esa ruta solo sera accesible con un token valido