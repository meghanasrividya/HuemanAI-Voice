"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const RESERVATION_OUTCOMES = [
    "Booking Secured",
    "Enquiry Handled",
    "Large Party Bookings",
    "Promotional / Offer",
    "Transferred to Staff",
    "Booking Cancelled",
    "General Assistance",
    "Calls After Hours",
    "Successful Upsells",
];

export const FEEDBACK_METRICS = [
    "Meaningful Feedback Given",
    "Non Meaningful",
    "Voicemail",
    "Failed/Unanswered",
    "Positive",
    "Negative",
    "Compliment",
    "Complaint",
    "Mixed",
];

export const CALL_IDS_URL_THRESHOLD = 50;

export const PUSH_OPT_OUT_KEY =
    "push-notifications-opted-out";

export const normalizeReservationOutcomeFilter =
    (
        value: string
    ): string => {
        return (
            RESERVATION_OUTCOMES.find(
                (item) =>
                    item.toLowerCase() ===
                    value
                        .trim()
                        .toLowerCase()
            ) || value
        );
    };

export const normalizeFeedbackMetricFilter =
    (
        value: string
    ): string => {
        const trimmed =
            value.trim();

        const lower =
            trimmed.toLowerCase();

        const aliases: Record<
            string,
            string
        > = {
            meaningful:
                "Meaningful Feedback Given",

            "meaningful calls":
                "Meaningful Feedback Given",

            unanswered:
                "Failed/Unanswered",

            "failed unanswered":
                "Failed/Unanswered",

            neutral: "Mixed",
        };

        return (
            aliases[lower] ||
            FEEDBACK_METRICS.find(
                (item) =>
                    item.toLowerCase() ===
                    lower
            ) ||
            trimmed
        );
    };

type User = {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
    is_admin?: boolean;

    [key: string]: any;
};

type AuthStore = {
    token: string | null;

    user: User | null;

    isAuthenticated: boolean;

    login: (
        token: string,
        user: User
    ) => void;

    logout: () => void;

    updateUser: (
        userData: Partial<User>
    ) => void;
};

export const useAuthStore =
    create<AuthStore>()(
        persist(
            (set) => ({
                token: null,

                user: null,

                isAuthenticated: false,

                login: (
                    token,
                    user
                ) => {
                    set({
                        token,
                        user,
                        isAuthenticated: true,
                    });

                    if (
                        typeof document !==
                        "undefined"
                    ) {
                        const secure =
                            window.location
                                .protocol ===
                            "https:"
                                ? "; Secure"
                                : "";

                        document.cookie =
                            `auth-token=${token}; path=/; max-age=604800; SameSite=Strict${secure}`;

                        if (user.role) {
                            document.cookie =
                                `user-role=${user.role}; path=/; max-age=604800; SameSite=Strict${secure}`;
                        }
                    }
                },

                logout: () => {
                    set({
                        token: null,
                        user: null,
                        isAuthenticated: false,
                    });

                    if (
                        typeof document !==
                        "undefined"
                    ) {
                        document.cookie =
                            "auth-token=; path=/; max-age=0";

                        document.cookie =
                            "user-role=; path=/; max-age=0";

                        document.cookie
                            .split(";")
                            .forEach(
                                (
                                    cookie
                                ) => {
                                    const eqPos =
                                        cookie.indexOf(
                                            "="
                                        );

                                    const cookieName =
                                        eqPos >
                                        -1
                                            ? cookie
                                                .substr(
                                                    0,
                                                    eqPos
                                                )
                                                .trim()
                                            : cookie.trim();

                                    if (
                                        cookieName.startsWith(
                                            "auth-"
                                        ) ||
                                        cookieName.startsWith(
                                            "XSRF-"
                                        )
                                    ) {
                                        document.cookie =
                                            `${cookieName}=; path=/; max-age=0`;

                                        document.cookie =
                                            `${cookieName}=; path=/; domain=${window.location.hostname}; max-age=0`;
                                    }
                                }
                            );
                    }
                },

                updateUser: (
                    userData
                ) => {
                    set(
                        (state) => ({
                            user:
                                state.user
                                    ? {
                                        ...state.user,
                                        ...userData,
                                    }
                                    : null,
                        })
                    );
                },
            }),
            {
                name: "auth-storage",

                partialize: (
                    state
                ) => ({
                    token:
                    state.token,

                    user:
                    state.user,

                    isAuthenticated:
                    state.isAuthenticated,
                }),
            }
        )
    );

export const getUserFullName =
    (
        user?: User | null
    ): string => {
        if (!user) return "";

        if (
            user.first_name &&
            user.last_name
        ) {
            return `${user.first_name} ${user.last_name}`;
        }

        if (user.first_name) {
            return user.first_name;
        }

        if (user.last_name) {
            return user.last_name;
        }

        return user.email || "";
    };

export const hasActionsOnlyRole =
    (
        user?: User | null
    ): boolean => {
        return (
            (
                user?.role || ""
            ).toLowerCase() ===
            "actions"
        );
    };

export const isAdmin = (
    user?: User | null
): boolean => {
    if (
        user?.is_admin !==
        undefined
    ) {
        return user.is_admin;
    }

    const role = (
        user?.role || ""
    )
        .toLowerCase()
        .replace(/\s+/g, "");

    return (
        role === "admin" ||
        role === "systemadmin"
    );
};