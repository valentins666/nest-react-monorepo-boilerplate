import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
// import * as knexConfig from '../../knex.config';

@Module({
  imports: [],
  exports: [KnexModule],
})
export class DatabaseModule {}
