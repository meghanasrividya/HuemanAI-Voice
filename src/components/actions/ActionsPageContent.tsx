"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, BellOff, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { formatDateInTimezone, parseTimestampAsUtc, DEFAULT_DISPLAY_TIMEZONE, getDateKeyInTimezone } from "@/lib/date/dateUtils";
import { ACTION_STATUS_LABELS, ACTION_REQUEST_TYPE_LABELS } from "@/lib/actions/constants";
import { useActionsList, useActionStats, useUpdateAction, useCreateAction, useActionHotels } from "@/hooks/useActions";
import { actionsApi } from "@/lib/api/actions";
import { PaginationControls } from "@/components/ui/pagination";
import { ActionStatusBadge, ActionPriorityBadge } from "@/components/actions/ActionBadges";
import toast from "react-hot-toast";
import { PUSH_OPT_OUT_KEY } from "@/store/authStore";

function StatCard({ label, count, changePct, isOverdue }: { label: string; count: number; changePct: number; isOverdue?: boolean }) {
    const up = changePct > 0;
    return (
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-premium-sm relative overflow-hidden group">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={cn("mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold", isOverdue && count > 0 && "text-red-500")}>{count}</p>
            {changePct !== 0 && (
                <div className={cn("mt-1 flex items-center gap-1 text-[10px] sm:text-xs", isOverdue ? (up ? "text-red-400" : "text-emerald-400") : (up ? "text-emerald-400" : "text-red-400"))}>
                    <span>{Math.abs(changePct).toFixed(0)}% vs prev</span>
                </div>
            )}
        </div>
    );
}

function StatsRow({ data, isLoading }: { data: any; isLoading: boolean }) {
    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-4">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="mt-2 h-7 w-12" />
                        <Skeleton className="mt-1 h-3 w-24" />
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Open Actions" count={data.open_actions.count} changePct={data.open_actions.change_pct} />
            <StatCard label="Due Today" count={data.due_today.count} changePct={data.due_today.change_pct} />
            <StatCard label="Overdue" count={data.overdue.count} changePct={data.overdue.change_pct} isOverdue />
            {data.top_types.slice(0, 2).map((t: any) => (
                <StatCard key={t.request_type} label={t.label} count={t.count} changePct={t.change_pct} />
            ))}
        </div>
    );
}

function formatRelativeDate(value: string | null | undefined) {
    if (!value) return "N/A";
    try {
        const d = parseTimestampAsUtc(value);
        const now = new Date();
        if (getDateKeyInTimezone(d) === getDateKeyInTimezone(now)) {
            return formatDateInTimezone(d, { hour: "2-digit", minute: "2-digit" }, DEFAULT_DISPLAY_TIMEZONE);
        }
        return formatDateInTimezone(d, { month: "short", day: "numeric" }, DEFAULT_DISPLAY_TIMEZONE) + " " + formatDateInTimezone(d, { hour: "2-digit", minute: "2-digit" }, DEFAULT_DISPLAY_TIMEZONE);
    } catch { return "N/A"; }
}

function formatDueTime(value: string | null | undefined, isOverdue: boolean) {
    if (!value) return "N/A";
    try {
        const d = parseTimestampAsUtc(value);
        const now = new Date();
        const diff = d.getTime() - now.getTime();
        const hours = Math.round(diff / 3600000);
        if (isOverdue) {
            const mins = Math.round(-diff / 60000);
            if (mins < 60) return `${mins}m overdue`;
            const h = Math.round(mins / 60);
            if (h < 24) return `${h}h overdue`;
            return `${Math.round(h / 24)}d overdue`;
        }
        if (hours < 1) return "Due soon";
        if (hours < 24) return `In ${hours}h`;
        return formatDateInTimezone(d, { month: "short", day: "numeric" }, DEFAULT_DISPLAY_TIMEZONE);
    } catch { return "N/A"; }
}

function CreateActionDialog() {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("misc");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [priority, setPriority] = useState("");
    const [notes, setNotes] = useState("");
    const create = useCreateAction();

    const submit = async () => {
        const data: any = { request_type: type, ...(name.trim() ? { guest_name: name.trim() } : {}), ...(phone.trim() ? { phone_number: phone.trim() } : {}), ...(priority ? { priority } : {}), ...(notes.trim() ? { notes: notes.trim() } : {}) };
        create.mutate(data, { onSuccess: () => { setOpen(false); setType("misc"); setName(""); setPhone(""); setPriority(""); setNotes(""); } });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> New Action
            </Button>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Action</DialogTitle>
                    <DialogDescription>Manually create an action item for team follow-up.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Issue Type *</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(ACTION_REQUEST_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v as string}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Guest Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7700 900000" />
                    </div>
                    <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger><SelectValue placeholder="Use default for type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional context..." rows={3} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={create.isPending}>Cancel</Button>
                    <Button onClick={submit} disabled={create.isPending}>
                        {create.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Action"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ActionsPageContent() {
    const { data: stats, isLoading: statsLoading, refetch } = useActionStats({});
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuthStore();

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [search, setSearch] = useState(() => searchParams.get("search") || "");
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [status, setStatus] = useState(() => searchParams.get("status") || "");
    const [type, setType] = useState(() => searchParams.get("type") || "");
    const [priority, setPriority] = useState(() => searchParams.get("priority") || "");
    const [sortBy, setSortBy] = useState(() => searchParams.get("sortBy") || "due_at");
    const [sortOrder, setSortOrder] = useState(() => searchParams.get("sortOrder") || "desc");
    const [resolveId, setResolveId] = useState<number | null>(null);
    const [resolveNotes, setResolveNotes] = useState("");
    const { mutate: updateAction, isPending: updating } = useUpdateAction();

    const onSearchChange = useCallback((val: string) => {
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 300);
    }, []);

    const params = {
        page, limit: 20, sortBy, sortOrder,
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        ...(status ? { status } : {}),
        ...(type ? { request_type: type } : {}),
        ...(priority ? { priority } : {}),
        excludeResolved: !status || status !== "resolved",
    };

    const { data: actions, isLoading, isFetching, isError, error, refetch: refetchList } = useActionsList(params);
    const hasFilters = !!(debouncedSearch.trim() || status || type || priority || sortBy !== "due_at" || sortOrder !== "desc");

    const clearFilters = () => { setSearch(""); setDebouncedSearch(""); setStatus(""); setType(""); setPriority(""); setSortBy("due_at"); setSortOrder("desc"); setPage(1); };

    const handleResolve = (id: number, notes: string) => {
        updateAction({ id: id.toString(), data: { status: "resolved", ...(notes.trim() ? { resolution_notes: notes.trim() } : {}) } }, {
            onSuccess: () => { toast.success("Action marked as resolved"); setResolveId(null); setResolveNotes(""); refetch(); refetchList(); },
            onError: () => toast.error("Failed to update status"),
        });
    };

    return (
        <div className="flex flex-col min-h-dvh p-4 md:p-6 space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Action Center</h1>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">Manage and track guest follow-ups and resolutions</p>
                </div>
                <div className="flex items-center gap-2">
                    {isFetching && !isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />}
                    <Button variant="outline" size="sm" onClick={() => refetch()}>Refresh</Button>
                    <CreateActionDialog />
                </div>
            </div>

            {/* Stats */}
            <StatsRow data={stats} isLoading={statsLoading} />

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search by guest name or phone..." value={search} onChange={e => onSearchChange(e.target.value)} className="h-10 pl-10" />
                </div>
                <Select value={status || "all"} onValueChange={v => { setStatus(v === "all" ? "" : v); setPage(1); }}>
                    <SelectTrigger className="h-10 sm:w-[140px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.keys(ACTION_STATUS_LABELS).map(k => <SelectItem key={k} value={k}>{(ACTION_STATUS_LABELS as any)[k]}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={type || "all"} onValueChange={v => { setType(v === "all" ? "" : v); setPage(1); }}>
                    <SelectTrigger className="h-10 sm:w-[140px]"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.keys(ACTION_REQUEST_TYPE_LABELS).map(k => <SelectItem key={k} value={k}>{(ACTION_REQUEST_TYPE_LABELS as any)[k]}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={priority || "all"} onValueChange={v => { setPriority(v === "all" ? "" : v); setPage(1); }}>
                    <SelectTrigger className="h-10 sm:w-[120px]"><SelectValue placeholder="All Priorities" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={v => { setSortBy(v); setPage(1); }}>
                    <SelectTrigger className="h-10 sm:w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="due_at">Due Date</SelectItem>
                        <SelectItem value="created_at">Created</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={v => { setSortOrder(v); setPage(1); }}>
                    <SelectTrigger className="h-10 sm:w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {hasFilters && <Button variant="outline" size="sm" onClick={clearFilters}>Reset Filters</Button>}

            {/* List */}
            {isLoading && (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
            )}

            {isError && !isLoading && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
                    <p className="text-sm text-destructive">{(error as any)?.message || "Failed to load actions."}</p>
                    <Button variant="outline" size="sm" onClick={() => refetchList()} className="mt-2">Retry</Button>
                </div>
            )}

            {!isLoading && actions && actions.data.length > 0 && (
                <>
                    <div className="flex flex-col rounded-xl border border-border bg-card shadow-premium-sm">
                        <div className="overflow-auto">
                            <table className="w-full">
                                <thead className="border-b border-border bg-secondary/30 sticky top-0 z-10">
                                    <tr>
                                        {["Created", "Guest", "Phone", "Issue Type", "Priority", "Status", "Due", "Comments"].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground bg-secondary">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {actions.data.map((action: any, idx: number) => (
                                        <motion.tr
                                            key={action.id}
                                            onClick={() => router.push(`/actions/${action.id}`)}
                                            className={cn("cursor-pointer transition-colors hover:bg-secondary/30", action.follow_up_count > 0 && "bg-orange-500/[0.04] shadow-[inset_3px_0_0_0_rgb(249,115,22)]")}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.05 * idx }}
                                        >
                                            <td className="px-4 py-4 text-sm">{formatRelativeDate(action.created_at)}</td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-medium">{action.guest_name || "Unknown"}</p>
                                                {action.follow_up_count > 0 && (
                                                    <span className="text-[10px] uppercase text-orange-500 font-bold tracking-wide">Repeat x{action.follow_up_count + 1}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground font-mono">{action.phone_number || "N/A"}</td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className="text-xs">{(ACTION_REQUEST_TYPE_LABELS as any)[action.request_type] || action.request_type_label}</Badge>
                                            </td>
                                            <td className="px-4 py-4"><ActionPriorityBadge priority={action.priority} /></td>
                                            <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="outline-none"><ActionStatusBadge status={action.status} showChevron /></button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="w-[180px]">
                                                        {Object.keys(ACTION_STATUS_LABELS).map(s => (
                                                            <DropdownMenuItem key={s} className={cn("cursor-pointer text-sm py-2 px-3", action.status === s && "bg-secondary/50 font-medium")} onClick={() => { if (s === "resolved") { setResolveId(action.id); setResolveNotes(""); } else if (s !== action.status) { updateAction({ id: action.id.toString(), data: { status: s } }); } }}>
                                                                {(ACTION_STATUS_LABELS as any)[s]}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={cn("text-sm", action.is_overdue && "text-red-500 font-medium")}>
                                                    {action.is_overdue && <AlertTriangle className="inline h-3 w-3 mr-1" />}
                                                    {formatDueTime(action.due_at, action.is_overdue)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 max-w-[200px]">
                                                <span className="text-sm text-foreground font-medium line-clamp-2 block" title={action.comments || ""}>
                                                    {action.comments ? (action.comments.length > 30 ? `${action.comments.substring(0, 30)}...` : action.comments) : "-"}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {actions.pagination?.total > actions.pagination?.limit && (
                        <PaginationControls pagination={actions.pagination} onPageChange={setPage} />
                    )}
                </>
            )}

            {!isLoading && !isError && actions && actions.data.length === 0 && (
                <div className="rounded-lg border border-border bg-card p-8 sm:p-12 text-center">
                    <p className="text-sm text-muted-foreground">No actions found</p>
                    {hasFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">Clear filters</Button>}
                </div>
            )}

            {/* Resolve dialog */}
            <Dialog open={resolveId !== null} onOpenChange={open => !open && setResolveId(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Resolve Action</DialogTitle>
                        <DialogDescription>Please add a brief note about how this issue was resolved.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea placeholder="Type resolution notes here..." value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} className="min-h-[120px]" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResolveId(null)} disabled={updating}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => resolveId && handleResolve(resolveId, resolveNotes)} disabled={updating || !resolveNotes.trim()}>
                            {updating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Mark as Resolved"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
