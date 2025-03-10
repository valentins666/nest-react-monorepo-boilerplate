import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

import { BASE_URL } from '@/config';

export type ErrorMsg = {
  status: number;
  message: string;
};

export const formDataHeader = { 'content-type': 'multipart/form-data' };

const headers: Readonly<Record<string, string | boolean | null>> = {
  Accept: 'application/json',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Requested-With': 'XMLHttpRequest',
};

class ApiService {
  private instance: AxiosInstance | null = null;

  private get http(): AxiosInstance {
    return this.instance != null ? this.instance : this.initApi();
  }

  initApi() {
    const axiosClient = axios.create({
      baseURL: `${BASE_URL}/api`,
      headers,
    });

    axiosClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        return this.handleError(error);
      },
    );

    this.instance = axiosClient;
    return axiosClient;
  }

  async request<T = unknown, R = AxiosResponse<T>>(
    config: AxiosRequestConfig,
  ): Promise<R> {
    return this.http.request(config);
  }

  async get<T = unknown, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.http.get<T, R>(url, config);
  }

  async post<T = unknown, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.http.post<T, R>(url, data, config);
  }

  async put<T = unknown, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.http.put<T, R>(url, data, config);
  }

  async patch<T = unknown, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.http.patch<T, R>(url, data, config);
  }

  async delete<T = unknown, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.http.delete<T, R>(url, config);
  }

  private async handleError(error: AxiosError): Promise<ErrorMsg> {
    const { response } = error;

    const status = response?.status || 500;
    const message = response?.statusText || 'Internal server error';

    return Promise.reject({ status, message });
  }
}

export const apiService = new ApiService();
