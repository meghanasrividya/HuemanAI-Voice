import { apiClient } from "@/lib/apiClient";

export const fetchWhatsappConversations = async (
    page = 1,
    limit = 20,
    search?: string,
    hotel?: string,
    status?: string,
    sortBy?: string,
    sortOrder?: string
) => {
    const response = await apiClient.get(
        "/whatsapp/conversations",
        {
            params: {
                page,
                limit,
                search,
                hotel,
                status,
                sortBy,
                sortOrder,
            },
        }
    );

    return response.data;
};

export const fetchWhatsappMessages = async (
    conversationId: string
) => {
    const response = await apiClient.get(
        `/whatsapp/conversations/${conversationId}/messages`
    );

    return response.data;
};

export const fetchWhatsappPhone = async (
    conversationId: string
) => {
    const response = await apiClient.get(
        `/whatsapp/conversations/${conversationId}/phone`
    );

    return response.data;
};

export const fetchWhatsappSummary = async (
    conversationId: string,
    forceRefresh = false
) => {
    const response = await apiClient.get(
        `/whatsapp/conversations/${conversationId}/summary`,
        {
            params: forceRefresh
                ? { forceRefresh: "true" }
                : undefined,
        }
    );

    return response.data;
};