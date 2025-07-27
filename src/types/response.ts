export interface ApiResponse<T> {
    message: string;
    metadata: T;
    status: number;
}
