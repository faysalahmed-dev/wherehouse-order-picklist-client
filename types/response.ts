export interface APIResponse<T> {
    data: T;
    error: boolean;
}
export interface PaginationAPIResponse<T> {
    data: T;
    error: boolean;
    limit: number;
    page: number;
    total_pages: number;
    total_items: number;
}
