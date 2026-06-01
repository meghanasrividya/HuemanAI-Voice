"use client";

import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import SummarySidebar from "./SummarySidebar";

import {
    fetchWhatsappConversations,
    fetchWhatsappMessages,
    fetchWhatsappSummary,
} from "@/lib/api/whatsapp";

import { Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type SortOrder = "ASC" | "DESC";

export default function WhatsappDashboard() {
    const [selectedConversation, setSelectedConversation] =
        useState<any>(null);

    const [search, setSearch] =
        useState("");

    const [hotel, setHotel] =
        useState("all");

    const [status, setStatus] =
        useState("all");

    const [sortBy, setSortBy] =
        useState("last_message_at");

    const [sortOrder, setSortOrder] =
        useState<SortOrder>("DESC");

    const [page, setPage] =
        useState(1);

    const limit = 20;

    /*
     * Conversations
     */
    const {
        data: conversationsData,
        isLoading:
            conversationsLoading,
    } = useQuery({
        queryKey: [
            "whatsapp-conversations",
            page,
            search,
            hotel,
            status,
            sortBy,
            sortOrder,
        ],

        queryFn: () =>
            fetchWhatsappConversations(
                page,
                limit,
                search,
                hotel === "all"
                    ? undefined
                    : hotel,
                status === "all"
                    ? undefined
                    : status,
                sortBy,
                sortOrder
            ),
    });

    const conversations =
        conversationsData?.data || [];

    /*
     * Messages
     */
    const {
        data: messagesData,
        isLoading: messagesLoading,
    } = useQuery({
        queryKey: [
            "whatsapp-messages",
            selectedConversation?.id,
        ],

        queryFn: () =>
            fetchWhatsappMessages(
                selectedConversation.id
            ),

        enabled:
            !!selectedConversation?.id,
    });

    const messages =
        messagesData?.messages || [];

    /*
     * Summary
     */
    const {
        data: summary,
        isLoading: summaryLoading,
        isError: summaryError,
        refetch: refreshSummary,
    } = useQuery({
        queryKey: [
            "whatsapp-summary",
            selectedConversation?.id,
        ],

        queryFn: () =>
            fetchWhatsappSummary(
                selectedConversation.id
            ),

        enabled:
            !!selectedConversation?.id,

        staleTime: 1000 * 60 * 10,
    });

    /*
     * Hotel options
     */
    const hotels = useMemo<string[]>(() => {
        return (Array.from(
            new Set(
                conversations
                    .map(
                        (c: any) =>
                            c.active_hotel as string
                    )
                    .filter(Boolean)
            )
        ).sort() as string[];
    }, [conversations]);

    /*
     * Refresh summary
     */
    const handleRefreshSummary =
        useCallback(async () => {
            await refreshSummary();
        }, [refreshSummary]);

    /*
     * Layout
     */
    return (
        <div className="flex flex-col flex-1 min-h-0 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        WhatsApp
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {conversationsData
                            ?.pagination?.total || 0}{" "}
                        conversations total
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Select
                        value={hotel}
                        onValueChange={setHotel}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Hotel" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                All Hotels
                            </SelectItem>

                            {hotels.map((item) => (
                                <SelectItem
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={status}
                        onValueChange={setStatus}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                All Status
                            </SelectItem>

                            <SelectItem value="active">
                                Active
                            </SelectItem>

                            <SelectItem value="expired">
                                Expired
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={sortOrder}
                        onValueChange={(
                            value
                        ) =>
                            setSortOrder(
                                value as SortOrder
                            )
                        }
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="DESC">
                                Desc
                            </SelectItem>

                            <SelectItem value="ASC">
                                Asc
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Main */}
            <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                {/* Left */}
                <ConversationList
                    conversations={conversations}
                    selectedConversation={
                        selectedConversation
                    }
                    search={search}
                    onSearchChange={setSearch}
                    onSelectConversation={
                        setSelectedConversation
                    }
                    loading={
                        conversationsLoading
                    }
                />

                {/* Center */}
                {selectedConversation ? (
                    <ChatWindow
                        conversation={
                            selectedConversation
                        }
                        messages={messages}
                        loading={messagesLoading}
                        onBack={() =>
                            setSelectedConversation(
                                null
                            )
                        }
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center text-muted-foreground">
                        Select a conversation
                    </div>
                )}

                {/* Right */}
                {selectedConversation && (
                    <div className="hidden xl:block w-[380px] shrink-0 border-l border-border">
                        <SummarySidebar
                            summary={summary}
                            isLoading={
                                summaryLoading
                            }
                            isError={summaryError}
                            onRefresh={
                                handleRefreshSummary
                            }
                        />
                    </div>
                )}
            </div>

            {/* Pagination */}
            {conversationsData?.pagination
                ?.totalPages > 1 && (
                <div className="flex items-center justify-between py-4 border-t border-border mt-4">
                    <div className="text-sm text-muted-foreground">
                        Showing{" "}
                        {(page - 1) * limit + 1} to{" "}
                        {Math.min(
                            page * limit,
                            conversationsData
                                .pagination.total
                        )}{" "}
                        of{" "}
                        {
                            conversationsData
                                .pagination.total
                        }
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                setPage((p) =>
                                    Math.max(1, p - 1)
                                )
                            }
                            disabled={page === 1}
                            className="h-9 px-3 rounded-md border border-border disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <button
                            onClick={() =>
                                setPage((p) =>
                                    Math.min(
                                        conversationsData
                                            .pagination
                                            .totalPages,
                                        p + 1
                                    )
                                )
                            }
                            disabled={
                                page ===
                                conversationsData
                                    .pagination
                                    .totalPages
                            }
                            className="h-9 px-3 rounded-md border border-border disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}