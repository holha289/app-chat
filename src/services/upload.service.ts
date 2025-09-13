import { ApiResponse } from "@app/types/response";
import apiService from "./api.service"


class UploadService {

    public static uploadSingleFile = async (file: any): Promise<string> => {
        const formData = new FormData();
        const fileName = file.split("/").pop() || "avatar.jpg";
        // @ts-ignore - React Native's FormData implementation differs from standard web FormData
        formData.append('files', {
            uri: file,
            name: fileName,
            type: "image/jpeg"
        });
        const response = await apiService.post<ApiResponse<{ url: string }>>("/upload/single", formData);
        return response.metadata.url || "";
    }
}

export default UploadService;