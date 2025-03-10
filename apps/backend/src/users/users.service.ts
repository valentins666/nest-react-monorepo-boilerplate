import { Injectable } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { IUser } from '@shared/types';

@Injectable()
export class UsersService {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async createUser(username: string): Promise<IUser> {
    const [newUser] = await this.knex('users')
      .insert({ username })
      .returning<IUser[]>('*');
    return newUser;
  }

  async getUsers() {
    return this.knex('users').select('*');
  }
}
