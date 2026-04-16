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
    UsersIcon,
    UserPlusIcon,
    UserMinusIcon,
    ShieldExclamationIcon,
    NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
    useAdminUsers,
    useAdminRegions,
    useActivateUser,
    useDeactivateUser,
    useDeleteAdminUser,
} from "@/lib/api/queries";
import { Table, Input, Select, Tag, Button, Modal } from "antd";
import { SearchInput } from "@/components/ui/SearchInput";
import { UserProfileModal } from "@/components/admin/UserProfileModal";
import { useToasts } from "@/hooks/useToasts";
import { cn } from "@/lib/utils";
import { CommonContainer } from "@/components/layout/CommonContainer";

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

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
    return (
        <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 16, padding: "20px 24px",
            display: "flex", alignItems: "center", gap: 16,
        }}>
            <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: color, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <Icon style={{ width: 20, height: 20, color: "white" }} />
            </div>
            <div>
                <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>{value}</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>{label}</p>
            </div>
        </div>
    );
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

    const { data, isLoading, isFetching, isError: usersError, error: usersErrorMsg } = useAdminUsers(params);
    const { data: regions = [], isError: regionsError, error: regionsErrorMsg } = useAdminRegions();
    const activateMut = useActivateUser();
    const deactivateMut = useDeactivateUser();
    const deleteMut = useDeleteAdminUser();

    const users = data?.users ?? [];

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

    const activeCount = users.filter((u: any) => u.isActive !== false).length;
    const inactiveCount = users.filter((u: any) => u.isActive === false).length;

    const columns = [
        {
            title: (
                <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => toggleSort("name")}>
                    Name <SortIcon field="name" sortBy={sortBy} order={order} />
                </div>
            ),
            key: "name",
            width: 220,
            render: (_: any, user: any) => (
                <div className="flex items-center gap-3 min-w-0">
                    {user.profilePic ? (
                        <img src={user.profilePic} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-sm" />
                    ) : (
                        <div className={cn(
                            "w-9 h-9 rounded-xl shrink-0 bg-linear-to-br flex items-center justify-center text-sm font-black text-white shadow-sm",
                            getGradient(user.name || user.email || "?")
                        )}>
                            {(user.name || user.email || "?")[0].toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-(--text) truncate m-0">{user.name || "—"}</p>
                        {user.role === "admin" && (
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">Admin</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            title: (
                <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => toggleSort("email")}>
                    Email <SortIcon field="email" sortBy={sortBy} order={order} />
                </div>
            ),
            dataIndex: "email",
            key: "email",
            width: 260,
            render: (email: string) => <span className="text-sm text-(--text-muted) truncate block" title={email}>{email}</span>
        },
        {
            title: "Region",
            dataIndex: "region",
            key: "region",
            width: 140,
            render: (region: string) => region
                ? <span className="text-xs font-medium px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400">{region}</span>
                : <span className="text-(--text-muted) opacity-30">—</span>
        },
        {
            title: (
                <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => toggleSort("createdAt")}>
                    Joined <SortIcon field="createdAt" sortBy={sortBy} order={order} />
                </div>
            ),
            dataIndex: "createdAt",
            key: "createdAt",
            width: 160,
            render: (createdAt: string) => (
                <div className="flex flex-col whitespace-nowrap">
                    <span className="text-sm font-medium text-(--text)">
                        {new Date(createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-(--text-muted) font-bold">
                        {new Date(createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                </div>
            )
        },
        {
            title: "Status",
            key: "status",
            width: 120,
            render: (_: any, user: any) => {
                const isActive = user.isActive !== false;
                return (
                    <Tag
                        color={isActive ? "success" : "error"}
                        icon={isActive ? <CheckCircleIcon className="w-3 h-3" /> : <NoSymbolIcon className="w-3 h-3" />}
                        style={{ borderRadius: 8, fontWeight: 800, border: "none", fontSize: "0.65rem", display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                        {isActive ? "Active" : "Inactive"}
                    </Tag>
                );
            }
        },
        {
            title: <div className="text-right">Actions</div>,
            key: "actions",
            align: "right" as const,
            width: 140,
            fixed: 'right' as const,
            render: (_: any, user: any) => {
                const isActive = user.isActive !== false;
                return (
                    <div className="flex gap-1 justify-end py-1">
                        <Button
                            type="text"
                            icon={<EyeIcon className="w-4 h-4" />}
                            className="text-(--text-muted) hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg"
                            onClick={() => setProfileUserId(user._id)}
                            title="View Profile"
                        />
                        <Button
                            type="text"
                            icon={isActive ? <UserMinusIcon className="w-4 h-4" /> : <UserPlusIcon className="w-4 h-4" />}
                            className={cn(
                                "rounded-lg",
                                isActive ? "text-amber-500 hover:bg-amber-500/10" : "text-emerald-500 hover:bg-emerald-500/10",
                                user.role === 'admin' && "opacity-20 cursor-not-allowed grayscale"
                            )}
                            disabled={user.role === 'admin'}
                            onClick={() => handleToggleActive(user)}
                            title={user.role === 'admin' ? "Admin cannot be deactivated" : (isActive ? "Deactivate" : "Activate")}
                        />
                        <Button
                            type="text"
                            danger
                            icon={<TrashIcon className="w-4 h-4" />}
                            className={cn(
                                "rounded-lg hover:bg-red-400/10",
                                user.role === 'admin' && "opacity-20 cursor-not-allowed grayscale"
                            )}
                            disabled={user.role === 'admin'}
                            onClick={() => setDeleteTarget({ id: user._id, name: user.name || user.email })}
                            title={user.role === 'admin' ? "Admin cannot be deleted" : "Delete User"}
                        />
                    </div>
                );
            }
        }
    ];

    return (
        <CommonContainer className="py-8">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
                    User Management
                </h1>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {data ? `${data.total} total registered users` : "Loading..."}
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                <StatCard icon={UsersIcon} label="Total Users" value={data?.total ?? "—"} color="linear-gradient(135deg,#6366f1,#8b5cf6)" />
                <StatCard icon={UserPlusIcon} label="Active" value={activeCount} color="linear-gradient(135deg,#10b981,#059669)" />
                <StatCard icon={ShieldExclamationIcon} label="Inactive" value={inactiveCount} color="linear-gradient(135deg,#f59e0b,#ef4444)" />
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                    <SearchInput
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={v => { setSearch(v); setPage(1); }}
                        width="100%"
                        style={{ height: 44 }}
                    />
                </div>
                <Select
                    value={region || "all"}
                    onChange={value => { setRegion(value === "all" ? "" : value); setPage(1); }}
                    size="large"
                    style={{ width: 180, borderRadius: 12 }}
                    popupMatchSelectWidth={false}
                    options={[
                        { label: "All regions", value: "all" },
                        ...regions.map((r: string) => ({ label: r, value: r }))
                    ]}
                />
            </div>

            {/* Table */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                {isFetching && !isLoading && (
                    <div style={{ height: 3, background: "linear-gradient(90deg,#6366f1,#8b5cf6,#6366f1)", backgroundSize: "200%", animation: "shimmer 1.2s linear infinite", borderRadius: 2 }} />
                )}
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="_id"
                    scroll={{ x: 1000 }}
                    loading={isLoading && users.length === 0}
                    pagination={{
                        current: page,
                        pageSize: 15,
                        total: data?.total || 0,
                        onChange: p => setPage(p),
                        showSizeChanger: false,
                        placement: ["bottomCenter" as const],
                    }}
                    rowClassName={() => "hover:bg-white/[0.015] transition-colors"}
                    style={{ transition: "opacity 0.15s", opacity: isFetching && !isLoading ? 0.75 : 1 }}
                />
            </div>

            {/* Modals */}
            {profileUserId && (
                <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
            )}
            {deleteTarget && (
                <Modal
                    open
                    title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <TrashIcon style={{ width: 18, height: 18, color: "#ef4444" }} />
                            <span>Delete User</span>
                        </div>
                    }
                    onOk={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    confirmLoading={deleteMut.isPending}
                    centered
                >
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>
                        Are you sure you want to delete <strong style={{ color: "var(--text)" }}>"{deleteTarget.name}"</strong>?
                        This will permanently delete their account and all their pages.
                    </p>
                </Modal>
            )}

            <style>{`
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            `}</style>
        </CommonContainer>
    );
}
