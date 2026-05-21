"use client";

import { Eye, EyeOff, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

type Props = {
    conversations: any[];
    selectedConversation: any;
    search: string;
    onSearchChange: (value: string) => void;
    onSelectConversation: (conversation: any) => void;
    loading?: boolean;
    phones?: Record<string, string>;
    previews?: Record<string, string>;
    onTogglePhone?: (
        e: React.MouseEvent,
        id: string
    ) => void;
};

function formatPhone(phone?: string) {
    if (!phone) return "";

    const cleaned = String(phone).trim();

    return cleaned.startsWith("+")
        ? cleaned
        : `+${cleaned}`;
}

function truncate(
    text?: string,
    length = 60
) {
    if (!text) return "";

    const normalized = text
        .replace(/\s+/g, " ")
        .trim();

    return normalized.length > length
        ? normalized.slice(0, length - 3) +
        "..."
        : normalized;
}

function formatConversationTime(
    value?: string
) {
    if (!value) return "";

    const date = new Date(value);

    if (isNaN(date.getTime())) return "";

    const now = new Date();

    if (
        date.toDateString() ===
        now.toDateString()
    ) {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return `${date.getDate()}/${
        date.getMonth() + 1
    }/${date.getFullYear()}`;
}

const statusColors: Record<string, string> = {
    active: "bg-green-500",
    expired: "bg-red-500/50",
    pending: "bg-amber-500",
    closed: "bg-slate-500",
    resolved: "bg-blue-500",
};

function getStatusColor(status?: string) {
    if (!status) return "bg-green-500";

    return (
        statusColors[
            status.toLowerCase()
            ] || "bg-green-500"
    );
}

export default function ConversationList({
                                             conversations,
                                             selectedConversation,
                                             search,
                                             onSearchChange,
                                             onSelectConversation,
                                             loading,
                                             phones = {},
                                             previews = {},
                                             onTogglePhone,
                                         }: Props) {
    return (
        <aside className="hidden lg:flex w-[340px] xl:w-[360px] shrink-0 flex-col bg-card border-r border-border">
            {/* Search */}
            <div className="px-5 py-4 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                    <Input
                        value={search}
                        onChange={(e) =>
                            onSearchChange(e.target.value)
                        }
                        placeholder="Search a chat"
                        className="h-11 pl-10"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-2">
                {loading &&
                    Array.from({ length: 10 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="w-full px-4 py-3 flex items-center gap-3 border-b border-border/30"
                            >
                                <Skeleton className="w-12 h-12 rounded-full shrink-0" />

                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-5 w-32" />

                                        <Skeleton className="h-3 w-12" />
                                    </div>

                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        )
                    )}

                {!loading &&
                    conversations.length === 0 && (
                        <div className="px-5 py-4 text-sm text-muted-foreground">
                            No chats found.
                        </div>
                    )}

                {!loading &&
                    conversations.map(
                        (conversation) => {
                            const selected =
                                selectedConversation?.id ===
                                conversation.id;

                            const phone =
                                phones[
                                    conversation.id
                                    ] ||
                                conversation.phone ||
                                "";

                            return (
                                <button
                                    key={conversation.id}
                                    onClick={() =>
                                        onSelectConversation(
                                            conversation
                                        )
                                    }
                                    className={cn(
                                        "w-full px-4 py-3 text-left flex items-center gap-3 border-b border-border/40 transition-colors",
                                        selected
                                            ? "bg-secondary"
                                            : "hover:bg-secondary/50"
                                    )}
                                >
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold shrink-0">
                                        {conversation.name?.trim()
                                            ? conversation.name
                                                .charAt(0)
                                                .toUpperCase()
                                            : "?"}
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-[16px] font-medium text-foreground">
                                                {conversation.name?.trim()
                                                    ? conversation.name
                                                    : formatPhone(
                                                        phone
                                                    )}
                                            </p>

                                            <span
                                                className={cn(
                                                    "text-xs shrink-0",
                                                    selected
                                                        ? "text-primary font-semibold"
                                                        : "text-muted-foreground"
                                                )}
                                            >
                        {formatConversationTime(
                            conversation.last_message_at
                        )}
                      </span>
                                        </div>

                                        <div className="mt-1 flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    getStatusColor(
                                                        conversation.status
                                                    )
                                                )}
                                            />

                                            <p className="truncate text-[14px] text-muted-foreground">
                                                {truncate(
                                                    conversation.preview ||
                                                    previews[
                                                        conversation.id
                                                        ]
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-1 flex items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="h-5 text-[10px]"
                                            >
                                                {conversation.active_hotel ||
                                                    "N/A"}
                                            </Badge>

                                            {onTogglePhone && (
                                                <button
                                                    onClick={(e) =>
                                                        onTogglePhone(
                                                            e,
                                                            conversation.id
                                                        )
                                                    }
                                                    className="text-muted-foreground/50 hover:text-primary"
                                                >
                                                    {phones[
                                                        conversation.id
                                                        ] ? (
                                                        <EyeOff className="h-3 w-3" />
                                                    ) : (
                                                        <Eye className="h-3 w-3" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        }
                    )}
            </div>
        </aside>
    );
}