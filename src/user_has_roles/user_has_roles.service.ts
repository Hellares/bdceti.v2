import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserHasRolesService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async counterUserByRole(): Promise<{ total_tech: string; total_admin: string; total_client: string }> {
    const result = await this.dataSource.query(`      
    SELECT 
    (SELECT COUNT(*) FROM user_has_roles WHERE id_rol = 'TECH') as total_tech,
    (SELECT COUNT(*) FROM user_has_roles WHERE id_rol = 'ADMIN') as total_admin,
    (SELECT COUNT(*) FROM user_has_roles WHERE id_rol = 'CLIENT') as total_client
    `);
    return result[0];
  }
}
