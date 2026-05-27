import { apiClient } from "../apiClient";

export type ColumnInfo = {
    label: string;
    type: "string" | "date" | "number";
};

export type ReportMetadata = {
    reportType: string;
    columns: Record<string, ColumnInfo>;
    defaultColumns: string[];
    dateColumns: string[];
    _csrf?: string;
};

export type GenerateReportParams = {
    columns?: string[];
    dateField?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    pageSize?: number;
};

export type BookingReservation = {
    customer_name?: string;
    visit_date?: string;
    date_booked?: string;
    covers?: number;
    venue_name?: string;
    area?: string;
    channel?: string;
    tables?: number;
    promotions?: string;
    stay_duration?: number;
    customer_email?: string;
    mobile_number?: string;
    booking_notes?: string;
    [key: string]: any;
};

export type ReportDataResponse = {
    data: BookingReservation[];
    total: number;
    page: number;
    pageSize: number;
};

export async function fetchBookingsMetadata(): Promise<ReportMetadata> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    const response = await apiClient.get<ReportMetadata>("/reports/bookings/metadata", {
        headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-TOKEN": csrf
        }
    });
    return response.data;
}

export async function generateBookingsReport(
    params?: GenerateReportParams
): Promise<ReportDataResponse> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    const payload = params ? {
        columns: params.columns,
        date_field: params.dateField,
        start_date: params.startDate,
        end_date: params.endDate,
        search: params.search,
        page: params.page,
        page_size: params.pageSize,
    } : {};

    const response = await apiClient.post<ReportDataResponse>(
        "/reports/bookings/generate",
        payload,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-CSRF-TOKEN": csrf
            }
        }
    );
    return response.data;
}
