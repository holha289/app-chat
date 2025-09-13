import { API_URL } from "@app/config";
import authActions from "@app/features/auth/auth.action";
import { navigationRef } from "@app/navigation/RootNavigation";
import { RootState, store } from "@app/store";
import { ApiResponse } from "@app/types/response";
import Helpers from "@app/utils/helpers";
import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from "axios";

// Extend AxiosRequestConfig to include _retry property
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;

  // Trạng thái refresh queue
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 10000,
      headers: { "Content-Type": "application/json" }
    });

    // Interceptor request
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        // Xử lý FormData
        if (config.data instanceof FormData) {
          config.headers["Content-Type"] = "multipart/form-data";
        } else {
          config.headers["Content-Type"] = "application/json";
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor response
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Check expired → chạy ngầm refresh
        if (this.getExpiresIn()) {
          const isExpired = Helpers.checkExpiresIn(this.getExpiresIn() || 0);
          if (isExpired) {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              this.refreshToken().then((result) => {
                if (!result) return;
                const { accessToken, refreshToken, expiresIn } = result;
                if (accessToken) {
                  store.dispatch(
                    authActions.setTokens({ accessToken, refreshToken, expiresIn })
                  );
                }
              });
            }
          }
        }
        return response.data;
      },
      (error: AxiosError) => this.handleResponseError(error)
    );
  }

  // Singleton
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // ===== Refresh Queue Helpers =====
  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  // ===== Token Getters =====
  private getAccessToken(): string | null {
    const state: RootState = store.getState();
    return state.auth.tokens?.accessToken || null;
  }

  private getRefreshToken(): string | null {
    const state: RootState = store.getState();
    return state.auth.tokens?.refreshToken || null;
  }

  private getExpiresIn(): number | null {
    const state: RootState = store.getState();
    return state.auth.tokens?.expiresIn || 0;
  }

  // ===== Refresh Token API =====
  private async refreshToken(): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } | null> {
    const state: RootState = store.getState();
    const refreshToken = state.auth.tokens?.refreshToken;
    if (!refreshToken) return null;

    try {
      const response = await axios.post<
        ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>
      >(`${API_URL}/api/auth/refresh-token`, { refreshToken });

      const newAccessToken = response.data.metadata.accessToken;
      const newRefreshToken = response.data.metadata.refreshToken;
      const newExpiresIn = response.data.metadata.expiresIn;

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: newExpiresIn
      };
    } catch (err) {
      return null;
    }
  }

  // ===== Error Handler =====
  private handleResponseError(error: AxiosError) {
    const customError = {
      message: "Có lỗi xảy ra",
      status: error.response?.status,
      data: error.response?.data,
      isAxiosError: true,
      response: error.response
    };

    // Mapping lỗi server
    if (error.response) {
      const errorData = error.response.data as any;
      if (errorData?.message) customError.message = errorData.message;
      else if (errorData?.error) customError.message = errorData.error;
      else if (errorData?.details) customError.message = errorData.details;
      else {
        switch (error.response.status) {
          case 400:
            customError.message = "Yêu cầu không hợp lệ";
            break;
          case 401:
            customError.message = "Không có quyền truy cập";
            break;
          case 403:
            customError.message = "Bị từ chối truy cập";
            break;
          case 404:
            customError.message = "Không tìm thấy";
            break;
          case 500:
            customError.message = "Lỗi máy chủ";
            break;
          default:
            customError.message = `Lỗi ${error.response.status}`;
        }
      }
    } else if (error.request) {
      customError.message = "Không thể kết nối đến server";
    } else {
      customError.message = error.message || "Có lỗi xảy ra";
    }

    // ===== Xử lý 401 Unauthorized =====
    if (customError.status === 401) {
      const refreshToken = this.getRefreshToken();
      const originalRequest = error.config as InternalAxiosRequestConfig;

      if (refreshToken && originalRequest && !originalRequest._retry) {
        if (this.isRefreshing) {
          // Nếu đang refresh, đợi token mới
          return new Promise((resolve) => {
            this.addRefreshSubscriber((newToken) => {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              resolve(this.axiosInstance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        return this.refreshToken()
          .then((result) => {
            this.isRefreshing = false;
            if (!result) return Promise.reject(customError);

            const { accessToken, refreshToken, expiresIn } = result;

            store.dispatch(
              authActions.setTokens({ accessToken, refreshToken, expiresIn })
            );

            // Retry tất cả request đã chờ
            this.onRefreshed(accessToken);

            // Retry request gốc
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
            return this.axiosInstance(originalRequest);
          })
          .catch((err) => {
            this.isRefreshing = false;
            return Promise.reject(err);
          });
      } else {
        // Không có refresh token → logout
        store.dispatch(
          authActions.logout({
            callback: () => {
              const navigation = navigationRef.current;
              if (navigation) {
                navigation.navigate("Login");
              }
            }
          })
        );
      }
    }

    return Promise.reject(customError);
  }

  // ===== Public methods =====
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  public setBaseUrl(url: string): void {
    this.axiosInstance.defaults.baseURL = url;
  }

  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return await this.axiosInstance.get(url, { params });
  }

  public async post<T>(url: string, data?: Record<string, any>): Promise<T> {
    return await this.axiosInstance.post(url, data);
  }

  public async put<T>(url: string, data?: Record<string, any>): Promise<T> {
    return await this.axiosInstance.put(url, data);
  }

  public async patch<T>(url: string, data?: Record<string, any>): Promise<T> {
    return await this.axiosInstance.patch(url, data);
  }

  public async delete<T>(url: string): Promise<T> {
    return await this.axiosInstance.delete(url);
  }
}

const apiService = ApiService.getInstance();
export default apiService;
