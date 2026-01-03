export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
    status: boolean;
    metadata?: {
        request_id: string;
        pagination: Pagination;
    };
}

export interface Pipe {
    id: string;
    user_id: string;
    name: string;
    slug: string;
    target_url: string;
    is_active: boolean;
    jq_filter: string;
    created_at: string;
    updated_at: string;
}

export interface WebhookEvent {
    id: string;
    pipe_id: string;
    status_code: number;
    request_payload: Record<string, any>;
    transformed_payload: Record<string, any>;
    created_at: string;
}

export interface Pagination {
    page: number;
    page_size: number;
    total_page: number;
    total_data: number;
}
