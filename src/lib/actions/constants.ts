export const ACTION_STATUS_LABELS: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    waiting_on_guest: "Waiting on Guest",
    resolved: "Resolved",
};

export const ACTION_REQUEST_TYPE_LABELS: Record<string, string> = {
    promotions: "Promotion Enquiry",
    promotion_enquiry: "Promotion Enquiry",
    large_group: "Large Group Booking",
    large_group_booking: "Large Group Booking",
    system_error: "System Error",
    availability_error: "Availability Error",
    cancellation: "Cancellation",
    update: "Booking Update",
    booking_update: "Booking Update",
    waitlist: "Waitlist",
    lost_property: "Lost & Found",
    lost_and_found: "Lost & Found",
    misc: "Callback Needed",
    callback_request: "Callback Needed",
    booking_amendment: "Booking Amendment",
    complaint: "Complaint",
    special_request: "Special Request",
    dietary_requirement: "Dietary Requirement",
};

export const DIALOG_REQUEST_TYPE_OPTIONS = [
    { key: "promotions", label: "Promotion Enquiry" },
    { key: "large_group", label: "Large Group Booking" },
    { key: "system_error", label: "System Error" },
    { key: "availability_error", label: "Availability Error" },
    { key: "cancellation", label: "Cancellation" },
    { key: "update", label: "Booking Update" },
    { key: "waitlist", label: "Waitlist" },
    { key: "lost_property", label: "Lost & Found" },
    { key: "misc", label: "Callback Needed" },
];
