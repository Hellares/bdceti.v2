import { Controller, Get, Param, Query } from '@nestjs/common';
import { SunatService } from './sunat.service';



@Controller('sunat')
export class SunatController {
  constructor(private readonly sunatService: SunatService) {}

  @Get('dni/:dni')
  getInfoDni(@Param('dni') dni: string) {
    return this.sunatService.getDniInfo(dni);
  }

  @Get('ruc/:ruc')
  getInfoRuc(@Param('ruc') ruc: string) {
    return this.sunatService.getRucInfo(ruc);
  }
}
