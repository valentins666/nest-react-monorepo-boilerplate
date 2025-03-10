import { AxiosResponse } from 'axios';

import { IUser } from '@shared/types';

import { apiService } from './http';

export const UserService = {
  getUsers: async (): Promise<AxiosResponse<IUser[]>> => {
    return apiService.get(`/users`);
  },
  createUser: async (username: string): Promise<AxiosResponse<IUser>> => {
    return apiService.post(`/users`, { username });
  },
};
