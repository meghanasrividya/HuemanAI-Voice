import { apiClient } from "../apiClient";

export type ColumnInfo = {
    label: string;
    type: "string" | "date" | "number" | "boolean";
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
    filters?: Array<{ column: string; operator: string; value: string }>;
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

    const fromDate = params?.startDate ? (params.startDate.includes("T") ? params.startDate.split("T")[0] : params.startDate) : undefined;
    const toDate = params?.endDate ? (params.endDate.includes("T") ? params.endDate.split("T")[0] : params.endDate) : undefined;

    const operatorMap: Record<string, string> = {
        equals: "eq",
        contains: "like",
        in_list: "in",
        greater_than_or_equal: "gte",
        less_than_or_equal: "lte",
    };

    const formattedFilters = (params?.filters || []).map(f => {
        const mappedOp = operatorMap[f.operator] || f.operator;
        if (mappedOp === "in") {
            return {
                column: f.column,
                operator: mappedOp,
                values: f.value.split(",").map((v: string) => v.trim()).filter(Boolean)
            };
        }
        return {
            column: f.column,
            operator: mappedOp,
            value: f.value
        };
    });

    const hasDateRange = !!(fromDate || toDate);

    const payload = params ? {
        columns: params.columns,
        filters: formattedFilters,
        page: params.page,
        pageSize: params.pageSize,
        ...(hasDateRange ? {
            dateRange: {
                column: params.dateField,
                from: fromDate,
                to: toDate,
            }
        } : {}),
        ...(params.search ? { search: params.search } : {})
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

export type SuggestionsResponse = {
    column: string;
    values: string[];
    _csrf?: string;
};

export async function fetchBookingsSuggestions(
    column: string,
    search: string
): Promise<SuggestionsResponse> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    const response = await apiClient.get<SuggestionsResponse>("/reports/bookings/suggestions", {
        params: { column, search },
        headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-TOKEN": csrf
        }
    });
    return response.data;
}

export type FeedbackResponseItem = {
    customer_name?: string;
    visit_date?: string;
    rating_recommend?: number;
    rating_food?: number;
    comments?: string;
    rating_atmosphere?: number;
    rating_service?: number;
    rating_value?: number;
    review_type?: string;
    appearance?: string;
    reference_no?: string;
    [key: string]: any;
};

export type FeedbackReportDataResponse = {
    data: FeedbackResponseItem[];
    total: number;
    page: number;
    pageSize: number;
};

export async function fetchFeedbackMetadata(): Promise<ReportMetadata> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    try {
        const response = await apiClient.get<ReportMetadata>("/reports/feedback/metadata", {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-CSRF-TOKEN": csrf
            }
        });
        return response.data;
    } catch (err) {
        console.warn("Failed to fetch feedback metadata from server, using local fallback.", err);
        return {
            reportType: "feedback",
            columns: {
                customer_name: { label: "Customer Name", type: "string" },
                visit_date: { label: "Visit Date", type: "date" },
                rating_recommend: { label: "Recommend", type: "number" },
                rating_food: { label: "Food Rating", type: "number" },
                rating_atmosphere: { label: "Atmosphere", type: "number" },
                rating_service: { label: "Service Rating", type: "number" },
                rating_value: { label: "Value Rating", type: "number" },
                comments: { label: "Comments", type: "string" },
                review_type: { label: "Review Type", type: "string" },
                appearance: { label: "Appearance", type: "string" },
                reference_no: { label: "Reference No", type: "string" }
            },
            defaultColumns: [
                "customer_name",
                "visit_date",
                "rating_recommend",
                "rating_food",
                "comments"
            ],
            dateColumns: [
                "visit_date"
            ]
        };
    }
}

export async function generateFeedbackReport(
    params?: GenerateReportParams
): Promise<FeedbackReportDataResponse> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    const fromDate = params?.startDate ? (params.startDate.includes("T") ? params.startDate.split("T")[0] : params.startDate) : undefined;
    const toDate = params?.endDate ? (params.endDate.includes("T") ? params.endDate.split("T")[0] : params.endDate) : undefined;

    const operatorMap: Record<string, string> = {
        equals: "eq",
        contains: "like",
        in_list: "in",
        greater_than_or_equal: "gte",
        less_than_or_equal: "lte",
    };

    const formattedFilters = (params?.filters || []).map(f => {
        const mappedOp = operatorMap[f.operator] || f.operator;
        if (mappedOp === "in") {
            return {
                column: f.column,
                operator: mappedOp,
                values: f.value.split(",").map((v: string) => v.trim()).filter(Boolean)
            };
        }
        return {
            column: f.column,
            operator: mappedOp,
            value: f.value
        };
    });

    const hasDateRange = !!(fromDate || toDate);

    const payload = params ? {
        columns: params.columns,
        filters: formattedFilters,
        page: params.page,
        pageSize: params.pageSize,
        ...(hasDateRange ? {
            dateRange: {
                column: params.dateField,
                from: fromDate,
                to: toDate,
            }
        } : {}),
        ...(params.search ? { search: params.search } : {})
    } : {};

    const response = await apiClient.post<FeedbackReportDataResponse>(
        "/reports/feedback/generate",
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

export async function fetchFeedbackSuggestions(
    column: string,
    search: string
): Promise<SuggestionsResponse> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    const response = await apiClient.get<SuggestionsResponse>("/reports/feedback/suggestions", {
        params: { column, search },
        headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-TOKEN": csrf
        }
    });
    return response.data;
}

export type ActionResponseItem = {
    guest_name?: string | null;
    request_type?: string;
    priority?: string;
    status?: string;
    created_at?: string | null;
    due_at?: string | null;
    resolved_at?: string | null;
    notes?: string | null;
    resolution_notes?: string | null;
    comments?: string | null;
    follow_up_count?: number;
    overdue_notified?: boolean;
    phone_number?: string;
    [key: string]: any;
};

export type ActionsReportDataResponse = {
    data: ActionResponseItem[];
    total: number;
    page: number;
    pageSize: number;
};

export async function fetchActionsMetadata(): Promise<ReportMetadata> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    try {
        const response = await apiClient.get<ReportMetadata>("/reports/actions/metadata", {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-CSRF-TOKEN": csrf
            }
        });
        return response.data;
    } catch (err) {
        console.warn("Failed to fetch actions metadata from server, using local fallback.", err);
        return {
            reportType: "actions",
            columns: {
                request_type: { label: "Request Type", type: "string" },
                guest_name: { label: "Guest Name", type: "string" },
                phone_number: { label: "Phone Number", type: "string" },
                priority: { label: "Priority", type: "string" },
                status: { label: "Status", type: "string" },
                notes: { label: "Notes", type: "string" },
                resolution_notes: { label: "Resolution Notes", type: "string" },
                comments: { label: "Comments", type: "string" },
                created_at: null as any,
                due_at: { label: "Due Date", type: "date" },
                resolved_at: { label: "Resolved Date", type: "date" },
                follow_up_count: { label: "Follow Ups", type: "number" },
                overdue_notified: { label: "Overdue Notified", type: "boolean" }
            },
            defaultColumns: [
                "guest_name",
                "request_type",
                "priority",
                "status",
                "created_at",
                "due_at",
                "resolved_at"
            ],
            dateColumns: [
                "created_at",
                "due_at",
                "resolved_at"
            ]
        };
    }
}

export async function generateActionsReport(
    params?: GenerateReportParams
): Promise<ActionsReportDataResponse> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    const fromDate = params?.startDate ? (params.startDate.includes("T") ? params.startDate.split("T")[0] : params.startDate) : undefined;
    const toDate = params?.endDate ? (params.endDate.includes("T") ? params.endDate.split("T")[0] : params.endDate) : undefined;

    const operatorMap: Record<string, string> = {
        equals: "eq",
        contains: "like",
        in_list: "in",
        greater_than_or_equal: "gte",
        less_than_or_equal: "lte",
    };

    const formattedFilters = (params?.filters || []).map(f => {
        const mappedOp = operatorMap[f.operator] || f.operator;
        if (mappedOp === "in") {
            return {
                column: f.column,
                operator: mappedOp,
                values: f.value.split(",").map((v: string) => v.trim()).filter(Boolean)
            };
        }
        return {
            column: f.column,
            operator: mappedOp,
            value: f.value
        };
    });

    const hasDateRange = !!(fromDate || toDate);

    const payload = params ? {
        columns: params.columns,
        filters: formattedFilters,
        page: params.page,
        pageSize: params.pageSize,
        ...(hasDateRange ? {
            dateRange: {
                column: params.dateField,
                from: fromDate,
                to: toDate,
            }
        } : {}),
        ...(params.search ? { search: params.search } : {})
    } : {};

    const response = await apiClient.post<ActionsReportDataResponse>(
        "/reports/actions/generate",
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

export async function fetchActionsSuggestions(
    column: string,
    search: string
): Promise<SuggestionsResponse> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    const response = await apiClient.get<SuggestionsResponse>("/reports/actions/suggestions", {
        params: { column, search },
        headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-TOKEN": csrf
        }
    });
    return response.data;
}

export type CouponResponseItem = {
    coupon_code?: string;
    reference_no?: string;
    customer_name?: string;
    valid_from?: string;
    valid_until?: string;
    redeemed?: boolean;
    phone_no?: string;
    redeemed_at?: string | null;
    [key: string]: any;
};

export type CouponsReportDataResponse = {
    data: CouponResponseItem[];
    total: number;
    page: number;
    pageSize: number;
};

export async function fetchCouponsMetadata(): Promise<ReportMetadata> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    try {
        const response = await apiClient.get<ReportMetadata>("/reports/coupons/metadata", {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-CSRF-TOKEN": csrf
            }
        });
        return response.data;
    } catch (err) {
        console.warn("Failed to fetch coupons metadata from server, using local fallback.", err);
        return {
            reportType: "coupons",
            columns: {
                coupon_code: { label: "Coupon Code", type: "string" },
                reference_no: { label: "Reference No", type: "string" },
                customer_name: { label: "Customer Name", type: "string" },
                phone_no: { label: "Phone No", type: "string" },
                valid_from: { label: "Valid From", type: "date" },
                valid_until: { label: "Valid Until", type: "date" },
                redeemed: { label: "Redeemed", type: "boolean" },
                redeemed_at: { label: "Redeemed At", type: "date" }
            },
            defaultColumns: [
                "coupon_code",
                "reference_no",
                "customer_name",
                "valid_from",
                "valid_until",
                "redeemed"
            ],
            dateColumns: [
                "valid_from",
                "valid_until",
                "redeemed_at"
            ]
        };
    }
}

export async function generateCouponsReport(
    params?: GenerateReportParams
): Promise<CouponsReportDataResponse> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    const fromDate = params?.startDate ? (params.startDate.includes("T") ? params.startDate.split("T")[0] : params.startDate) : undefined;
    const toDate = params?.endDate ? (params.endDate.includes("T") ? params.endDate.split("T")[0] : params.endDate) : undefined;

    const operatorMap: Record<string, string> = {
        equals: "eq",
        contains: "like",
        in_list: "in",
        greater_than_or_equal: "gte",
        less_than_or_equal: "lte",
    };

    const formattedFilters = (params?.filters || []).map(f => {
        const mappedOp = operatorMap[f.operator] || f.operator;
        if (mappedOp === "in") {
            return {
                column: f.column,
                operator: mappedOp,
                values: f.value.split(",").map((v: string) => v.trim()).filter(Boolean)
            };
        }
        return {
            column: f.column,
            operator: mappedOp,
            value: f.value
        };
    });

    const hasDateRange = !!(fromDate || toDate);

    const payload = params ? {
        columns: params.columns,
        filters: formattedFilters,
        page: params.page,
        pageSize: params.pageSize,
        ...(hasDateRange ? {
            dateRange: {
                column: params.dateField,
                from: fromDate,
                to: toDate,
            }
        } : {}),
        ...(params.search ? { search: params.search } : {})
    } : {};

    const response = await apiClient.post<CouponsReportDataResponse>(
        "/reports/coupons/generate",
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

export async function fetchCouponsSuggestions(
    column: string,
    search: string
): Promise<SuggestionsResponse> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") || "" : "";
    const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

    const response = await apiClient.get<SuggestionsResponse>("/reports/coupons/suggestions", {
        params: { column, search },
        headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-TOKEN": csrf
        }
    });
    return response.data;
}

