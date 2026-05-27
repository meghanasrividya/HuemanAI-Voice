"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { actionsApi } from "@/lib/api/actions";

export function useActionsList(params: Record<string, any>) {
    return useQuery({
        queryKey: ["actions-list", params],
        queryFn: () => actionsApi.getList(params),
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
    });
}

export function useAction(id: string) {
    return useQuery({
        queryKey: ["action", id],
        queryFn: () => actionsApi.getAction(id),
        enabled: !!id,
    });
}

export function useActionStats(params: Record<string, any>) {
    return useQuery({
        queryKey: ["action-stats", params],
        queryFn: () => actionsApi.getStats(params),
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
}

export function useActionHotels() {
    return useQuery({
        queryKey: ["action-hotels"],
        queryFn: () => actionsApi.getHotels(),
        staleTime: 1000 * 60 * 5,
    });
}

export function useUpdateAction() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => actionsApi.updateAction(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["actions-list"] });
            qc.invalidateQueries({ queryKey: ["action"] });
        },
    });
}

export function useCreateAction() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Record<string, any>) => actionsApi.createAction(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["actions-list"] });
            qc.invalidateQueries({ queryKey: ["action-stats"] });
        },
    });
}
