import { RootState, store } from "@app/store";
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "@env";
class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;
  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${API_URL}/api`, // Thay đổi baseURL theo nhu cầu
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });

    // Thêm interceptor để xử lý request chung
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        //  TODO: Thêm logic để lấy token
        // const token = localStorage.getItem('authToken'); // Hoặc lấy từ store, context, ...
        const tokens = this.getAccessToken();
        console.log(tokens)
        if (tokens) {
          config.headers["Authorization"] = `Bearer ${tokens}`;
        }
        // config.headers['path']
        // kiểm tra formData
        if (config.data instanceof FormData) {
          config.headers["Content-Type"] = "multipart/form-data";
        } else {
          config.headers["Content-Type"] = "application/json";
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Thêm interceptor để xử lý response và error chung
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error: AxiosError) => {
        // Xử lý lỗi chung ở đây (như refresh token, lỗi mạng, ...)
        return Promise.reject(error);
      }
    );
  }

  // Singleton pattern - đảm bảo chỉ có một instance duy nhất
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  private getAccessToken(): string | null {
    const state: RootState = store.getState();
    return state.auth.tokens?.accessToken || null;
  }
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  public setBaseUrl(url: string): void {
    this.axiosInstance.defaults.baseURL = url;
  }

  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return await this.axiosInstance.get(url, { params });
  }

  public async post<T>(url: string, data: Record<string, any>): Promise<T> {
    return await this.axiosInstance.post(url, data);
  }

  public async put<T>(url: string, data: Record<string, any>): Promise<T> {
    return await this.axiosInstance.put(url, data);
  }

  public async patch<T>(url: string, data: Record<string, any>): Promise<T> {
    return await this.axiosInstance.patch(url, data);
  }

  public async delete<T>(url: string): Promise<T> {
    return await this.axiosInstance.delete(url);
  }
}

const apiService = ApiService.getInstance();
export default apiService;
