import { API_URL } from "@app/config";
import authActions from "@app/features/auth/auth.action";
import { navigationRef } from "@app/navigation/RootNavigation";
import { RootState, store } from "@app/store";
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
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
        if (tokens) {
          config.headers["Authorization"] = `Bearer ${tokens}`;
        }
        console.log('Request URL:', API_URL, config.url)
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
        // Tạo error object với thông tin chi tiết
        const customError = {
          message: "Có lỗi xảy ra",
          status: error.response?.status,
          data: error.response?.data,
          isAxiosError: true,
          response: error.response
        };

        // Nếu có response từ server
        if (error.response) {
          const errorData = error.response.data as any;
          
          // Ưu tiên lấy message từ server
          if (errorData?.message) {
            customError.message = errorData.message;
          } else if (errorData?.error) {
            customError.message = errorData.error;
          } else if (errorData?.details) {
            customError.message = errorData.details;
          } else {
            // Fallback dựa trên status code
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
          // Lỗi mạng
          customError.message = "Không thể kết nối đến server";
        } else {
          // Lỗi khác
          customError.message = error.message || "Có lỗi xảy ra";
        }

        if (customError.status === 401) {
           const state: RootState = store.getState();
           const refreshToken = state.auth.tokens?.refreshToken;
           if (refreshToken) {
              // TODO: Gọi API refresh token
               store.dispatch(authActions.logout({ callback: () => {
                  // navigationRef.navigate("Login");
                  const navigation = navigationRef.current;
                  if (navigation) {
                    navigation.navigate("Login");
                  }
               } }));
           } else {
              // Không có refresh token, dispatch logout action
              store.dispatch(authActions.logout({ callback: () => {
                  const navigation = navigationRef.current;
                  if (navigation) {
                    navigation.navigate("Login");
                  }
              } }));
           }
        }

        return Promise.reject(customError);
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
