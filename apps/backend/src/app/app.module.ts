import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../users/users.module';
import knexConfig from '../../knex.config';

@Module({
  imports: [
    KnexModule.forRoot({
      config: knexConfig, // Adjust if necessary
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
