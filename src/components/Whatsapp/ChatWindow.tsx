"use client";

import { useEffect, useMemo, useRef } from "react";

import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
    conversation: any;
    messages: any[];
    loading?: boolean;
    onBack?: () => void;
};

function formatTime(value?: string) {
    if (!value) return "";

    const date = new Date(value);

    if (isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDateDivider(
    value?: string
) {
    if (!value) return "";

    const date = new Date(value);

    if (isNaN(date.getTime())) return "";

    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(
        yesterday.getDate() - 1
    );

    if (
        date.toDateString() ===
        today.toDateString()
    ) {
        return "TODAY";
    }

    if (
        date.toDateString() ===
        yesterday.toDateString()
    ) {
        return "YESTERDAY";
    }

    return date
        .toLocaleDateString([], {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        .toUpperCase();
}

export default function ChatWindow({
                                       conversation,
                                       messages,
                                       loading,
                                       onBack,
                                   }: Props) {
    const containerRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.scrollTop =
            containerRef.current.scrollHeight;
    }, [messages]);

    const groupedMessages = useMemo(() => {
        return messages.map(
            (message, index) => {
                const currentDate = new Date(
                    message.created_at
                );

                const previous =
                    index > 0
                        ? messages[index - 1]
                        : null;

                const previousDate = previous
                    ? new Date(previous.created_at)
                    : null;

                const showDateDivider =
                    !previousDate ||
                    currentDate.toDateString() !==
                    previousDate.toDateString();

                return {
                    ...message,
                    showDateDivider,
                };
            }
        );
    }, [messages]);

    return (
        <div className="flex-1 min-w-0 flex flex-col bg-background relative h-full">
            {/* Background */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "url(/wp_bg_light.png)",
                    backgroundRepeat: "repeat",
                    backgroundSize: "650px",
                }}
            />

            {/* Header */}
            <div className="h-16 px-4 md:px-5 bg-card border-b border-border flex items-center justify-between shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground lg:hidden"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center font-semibold shrink-0 border border-border">
                            {conversation?.name?.trim()
                                ? conversation.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "?"}
                        </div>

                        <div className="flex flex-col min-w-0">
              <span className="text-[16px] md:text-[18px] font-semibold text-foreground truncate">
                {conversation?.name ||
                    "Guest"}
              </span>

                            <span className="text-xs text-muted-foreground truncate">
                {conversation?.active_hotel ||
                    "WhatsApp Chat"}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={containerRef}
                className="relative z-10 flex-1 overflow-y-auto px-4 md:px-8 xl:px-10 py-6 md:py-10 flex flex-col gap-4"
            >
                {loading && (
                    <div className="text-center py-3 bg-card rounded-md mx-auto px-6 text-muted-foreground text-sm font-medium border border-border">
                        Loading history...
                    </div>
                )}

                {!loading &&
                    messages.length === 0 && (
                        <div className="text-center py-3 bg-card rounded-md mx-auto px-6 text-muted-foreground text-sm font-medium border border-border">
                            No messages yet.
                        </div>
                    )}

                {!loading &&
                    groupedMessages.map(
                        (message, index) => {
                            const assistant =
                                message.role ===
                                "assistant" ||
                                message.role === "system";

                            return (
                                <div
                                    key={message.id || index}
                                >
                                    {/* Date Divider */}
                                    {message.showDateDivider && (
                                        <div className="my-3 flex items-center gap-4">
                                            <div className="h-px flex-1 bg-border" />

                                            <span className="text-xs font-bold tracking-[0.24em] text-muted-foreground">
                        {formatDateDivider(
                            message.created_at
                        )}
                      </span>

                                            <div className="h-px flex-1 bg-border" />
                                        </div>
                                    )}

                                    {/* Message */}
                                    <div
                                        className={cn(
                                            "w-full flex",
                                            assistant
                                                ? "justify-start"
                                                : "justify-end"
                                        )}
                                    >
                                        <div className="w-fit max-w-[85%] md:max-w-[70%] lg:max-w-[58%]">
                                            {/* Sender */}
                                            {assistant ? (
                                                <div className="mb-1 flex items-center gap-2 text-xs">
                          <span className="font-semibold text-emerald-500">
                            Sophie - AG Hotels
                          </span>

                                                    <span className="text-muted-foreground">
                            {formatTime(
                                message.created_at
                            )}
                          </span>
                                                </div>
                                            ) : (
                                                <div className="mb-1 text-right text-xs font-medium text-muted-foreground">
                                                    {formatTime(
                                                        message.created_at
                                                    )}
                                                </div>
                                            )}

                                            {/* Bubble */}
                                            <div
                                                className={cn(
                                                    "relative inline-block rounded-md px-4 py-3 text-[15px] leading-relaxed border shadow-sm",
                                                    assistant
                                                        ? "rounded-tl-sm bg-card text-foreground border-border"
                                                        : "rounded-tr-sm bg-[#005d67] text-white border-transparent"
                                                )}
                                            >
                                                {message.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    )}
            </div>
        </div>
    );
}