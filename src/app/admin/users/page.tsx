"use client";

import { useState, useCallback, useDeferredValue, useEffect } from "react";
import {
    MagnifyingGlassIcon,
    TrashIcon,
    EyeIcon,
    CheckCircleIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronUpDownIcon,
    FunnelIcon,
} from "@heroicons/react/24/outline";
import {
    useAdminUsers,
    useAdminRegions,
    useActivateUser,
    useDeactivateUser,
    useDeleteAdminUser,
} from "@/lib/api/queries";
import { UserProfileModal } from "@/components/admin/UserProfileModal";
import { ConfirmDialog } from "@/components/ui/glass/ConfirmDialog";
import { useToasts } from "@/hooks/useToasts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const GRADIENTS = [
    "from-indigo-500 to-violet-600",
    "from-blue-500 to-cyan-400",
    "from-amber-500 to-rose-500",
    "from-emerald-500 to-blue-500",
];
const getGradient = (seed: string) => GRADIENTS[seed.length % GRADIENTS.length];

type SortField = "name" | "email" | "createdAt";

function SortIcon({ field, sortBy, order }: { field: SortField; sortBy: SortField; order: "asc" | "desc" }) {
    if (sortBy !== field) return <ChevronUpDownIcon className="w-3.5 h-3.5 opacity-30" />;
    return order === "asc"
        ? <ChevronUpIcon className="w-3.5 h-3.5 text-indigo-400" />
        : <ChevronDownIcon className="w-3.5 h-3.5 text-indigo-400" />;
}

export default function AdminUsersPage() {
    const { success, error: toastError } = useToasts();

    const [search, setSearch] = useState("");
    const [region, setRegion] = useState("");
    const [sortBy, setSortBy] = useState<SortField>("createdAt");
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [profileUserId, setProfileUserId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const deferredSearch = useDeferredValue(search);

    const params: Record<string, string> = { sortBy, order, page: String(page), limit: "15" };
    if (deferredSearch) params.search = deferredSearch;
    if (region) params.region = region;

    const { data, isLoading, isError: usersError, error: usersErrorMsg } = useAdminUsers(params);
    const { data: regions = [], isError: regionsError, error: regionsErrorMsg } = useAdminRegions();
    const activateMut = useActivateUser();
    const deactivateMut = useDeactivateUser();
    const deleteMut = useDeleteAdminUser();

    const users = data?.users ?? [];
    const totalPages = data?.pages ?? 1;

    // Show exact error messages from backend (e.g. 403 "Forbidden: requires role [admin]")
    useEffect(() => {
        if (usersError) {
            toastError((usersErrorMsg as Error)?.message ?? "Failed to load users");
        } else if (regionsError) {
            toastError((regionsErrorMsg as Error)?.message ?? "Failed to load regions");
        }
    }, [usersError, regionsError, usersErrorMsg, regionsErrorMsg, toastError]);

    const handleToggleActive = useCallback(async (user: any) => {
        try {
            if (user.isActive === false) {
                await activateMut.mutateAsync(user._id);
                success(`${user.name || user.email} activated`);
            } else {
                await deactivateMut.mutateAsync(user._id);
                success(`${user.name || user.email} deactivated`);
            }
        } catch (err: any) {
            toastError(err?.message ?? "Failed to update user status");
        }
    }, [activateMut, deactivateMut, success, toastError]);

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return;
        try {
            await deleteMut.mutateAsync(deleteTarget.id);
            success("User and all their data deleted");
        } catch (err: any) {
            toastError(err?.message ?? "Failed to delete user");
        }
        setDeleteTarget(null);
    }, [deleteTarget, deleteMut, success, toastError]);

    const toggleSort = (field: SortField) => {
        if (sortBy === field) setOrder(o => o === "asc" ? "desc" : "asc");
        else { setSortBy(field); setOrder("asc"); }
        setPage(1);
    };

    const colHeaders: { label: string; field?: SortField }[] = [
        { label: "Name", field: "name" },
        { label: "Email", field: "email" },
        { label: "Region" },
        { label: "Joined", field: "createdAt" },
        { label: "Status" },
        { label: "Actions" },
    ];

    return (
        <div className="p-8 max-w-6xl w-full">
            {/* Title */}
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-(--text) tracking-tight">Users</h1>
                <p className="text-sm text-(--text-muted) mt-1">
                    {data ? `${data.total} total users` : "Loading..."}
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-52">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 bg-(--surface) border-(--border) text-(--text) placeholder:text-(--text-muted) h-10"
                    />
                </div>

                {/* Region */}
                <Select
                    value={region || "all"}
                    onValueChange={value => { setRegion(value === "all" ? "" : value); setPage(1); }}
                >
                    <SelectTrigger className="w-[180px] bg-(--surface) border-(--border)">
                        <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All regions</SelectItem>
                        {regions.map((r: string) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-(--surface) border border-(--border) rounded-2xl overflow-hidden mt-6">
                <Table>
                    <TableHeader className="bg-(--bg)">
                        <TableRow className="border-(--border) hover:bg-transparent">
                            {colHeaders.map(({ label, field }) => (
                                <TableHead
                                    key={label}
                                    onClick={() => field && toggleSort(field)}
                                    className={cn(
                                        "h-11 text-[11px] font-bold text-(--text-muted) uppercase tracking-wider select-none",
                                        field && "cursor-pointer hover:text-(--text)",
                                        label === "Actions" && "text-right"
                                    )}
                                >
                                    <div className={cn("flex items-center gap-1", label === "Actions" && "justify-end")}>
                                        {label}
                                        {field && <SortIcon field={field} sortBy={sortBy} order={order} />}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i} className="border-(--border) hover:bg-transparent">
                                <TableCell>
                                    <div className="flex items-center gap-2.5">
                                        <Skeleton className="w-8 h-8 rounded-lg bg-(--bg)" />
                                        <Skeleton className="h-4 w-28 bg-(--bg)" />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-4 w-36 bg-(--bg)" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16 bg-(--bg)" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20 bg-(--bg)" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16 rounded-full bg-(--bg)" /></TableCell>
                                <TableCell>
                                    <div className="flex gap-1.5 justify-end">
                                        {[0, 1, 2].map(j => <Skeleton key={j} className="w-7 h-7 rounded-lg bg-(--bg)" />)}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {!isLoading && users.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className="h-32 text-center text-(--text-muted) text-sm border-0">
                                    No users found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && users.map((user: any) => {
                            const isActive = user.isActive !== false;
                            return (
                                <TableRow
                                    key={user._id}
                                    className="border-(--border) hover:bg-white/[0.02] transition-colors"
                                >
                                    {/* Name */}
                                    <TableCell>
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg shrink-0 bg-gradient-to-br flex items-center justify-center text-xs font-black text-white",
                                                getGradient(user.name || user.email || "?")
                                            )}>
                                                {(user.name || user.email || "?")[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-(--text) truncate max-w-[150px]">{user.name || "—"}</span>
                                        </div>
                                    </TableCell>

                                    {/* Email */}
                                    <TableCell className="text-sm text-(--text-muted) max-w-[200px] truncate">
                                        {user.email}
                                    </TableCell>

                                    {/* Region */}
                                    <TableCell className="text-sm text-(--text-muted)">
                                        {user.region || <span className="opacity-30">—</span>}
                                    </TableCell>

                                    {/* Joined */}
                                    <TableCell className="text-xs text-(--text-muted)">
                                        {new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                                    </TableCell>

                                    {/* Status badge */}
                                    <TableCell>
                                        <Badge className={cn(
                                            "text-[10px] font-bold rounded-full border w-fit whitespace-nowrap",
                                            isActive
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="text-right">
                                        <div className="flex gap-1.5 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-(--text-muted) hover:text-indigo-400 hover:bg-indigo-400/10 shrink-0"
                                                title="View Profile"
                                                onClick={() => setProfileUserId(user._id)}
                                            >
                                                <EyeIcon className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title={isActive ? "Deactivate" : "Activate"}
                                                className={cn(
                                                    "h-7 w-7 shrink-0",
                                                    isActive
                                                        ? "text-amber-400 hover:bg-amber-400/10"
                                                        : "text-emerald-400 hover:bg-emerald-400/10"
                                                )}
                                                onClick={() => handleToggleActive(user)}
                                            >
                                                {isActive
                                                    ? <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                                                    : <CheckCircleIcon className="w-3.5 h-3.5" />
                                                }
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-400 hover:bg-red-400/10 shrink-0"
                                                title="Delete User"
                                                onClick={() => setDeleteTarget({ id: user._id, name: user.name || user.email })}
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-(--border) bg-(--surface) text-(--text) hover:bg-(--bg)"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                        .map(p => (
                            <Button
                                key={p}
                                variant={p === page ? "default" : "outline"}
                                size="icon"
                                className={cn(
                                    "h-9 w-9 text-sm",
                                    p === page
                                        ? "bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500"
                                        : "border-(--border) bg-(--surface) text-(--text-muted) hover:bg-(--bg)"
                                )}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </Button>
                        ))}
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-(--border) bg-(--surface) text-(--text) hover:bg-(--bg)"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Modals */}
            {profileUserId && (
                <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
            )}
            {deleteTarget && (
                <ConfirmDialog
                    open
                    title="Delete User"
                    description={`Are you sure you want to delete "${deleteTarget.name}"? This will permanently delete their account and all their pages.`}
                    confirmLabel="Delete"
                    variant="danger"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
