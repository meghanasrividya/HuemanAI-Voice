import {
    startOfDay,
    endOfDay,
    subDays,
    startOfMonth,
    endOfMonth,
} from "date-fns";

export const datePresets = [
    {
        label: "Today",

        getRange: () => ({
            from: startOfDay(
                new Date()
            ),

            to: endOfDay(
                new Date()
            ),
        }),
    },

    {
        label: "Last 7 Days",

        getRange: () => ({
            from: startOfDay(
                subDays(
                    new Date(),
                    6
                )
            ),

            to: endOfDay(
                new Date()
            ),
        }),
    },

    {
        label: "Last 30 Days",

        getRange: () => ({
            from: startOfDay(
                subDays(
                    new Date(),
                    29
                )
            ),

            to: endOfDay(
                new Date()
            ),
        }),
    },

    {
        label: "This Month",

        getRange: () => ({
            from:
                startOfMonth(
                    new Date()
                ),

            to: endOfMonth(
                new Date()
            ),
        }),
    },
];