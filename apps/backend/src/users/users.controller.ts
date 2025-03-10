import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import type { IUser } from '@shared/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() data: IUser): Promise<IUser> {
    return this.usersService.createUser(data.username);
  }

  @Get()
  async getAllUsers() {
    return await this.usersService.getUsers();
  }
}
