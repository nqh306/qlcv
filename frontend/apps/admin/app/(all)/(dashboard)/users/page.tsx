import { useState, useCallback } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import useSWR from "swr";
import { Loader as LoaderIcon, Search, UserPlus, Upload, RotateCcw, UserCheck, UserX, Shield, ShieldCheck } from "lucide-react";
import { Button, getButtonStyling } from "@plane/propel/button";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { Loader } from "@plane/ui";
import { cn } from "@plane/utils";
import type { IInstanceManagedUser } from "@plane/types";
import { PageWrapper } from "@/components/common/page-wrapper";
import { TempPasswordModal } from "@/components/users/temp-password-modal";
import { useUserManagement } from "@/hooks/store";
import type { Route } from "./+types/page";

function RoleBadge({ user }: { user: IInstanceManagedUser }) {
  if (user.admin_role === 30) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
        <ShieldCheck className="h-3 w-3" /> Super Admin
      </span>
    );
  }
  if (user.admin_role === 20) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <Shield className="h-3 w-3" /> Workspace Admin
        </span>
        {user.admin_scoped_workspaces.length > 0 && (
          <span className="text-[10px] text-tertiary">{user.admin_scoped_workspaces.join(", ")}</span>
        )}
      </div>
    );
  }
  return <span className="text-xs text-tertiary">User</span>;
}

const ROLE_FILTER_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "super_admin", label: "Super Admin" },
  { value: "workspace_admin", label: "Workspace Admin" },
  { value: "user", label: "Regular User" },
];

const UserManagementPage = observer(function UserManagementPage(_props: Route.ComponentProps) {
  const {
    userIds,
    users,
    loader,
    paginationInfo,
    searchQuery,
    setSearchQuery,
    fetchUsers,
    fetchNextUsers,
    resetPassword,
    toggleActive,
  } = useUserManagement();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [roleFilter, setRoleFilter] = useState("");
  const [resetModal, setResetModal] = useState<{ open: boolean; password: string; email: string }>({
    open: false,
    password: "",
    email: "",
  });

  useSWR("INSTANCE_USERS", () => fetchUsers(), { revalidateOnFocus: false });

  const hasNextPage = paginationInfo?.next_page_results && paginationInfo?.next_cursor !== undefined;

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput);
    fetchUsers();
  }, [searchInput, setSearchQuery, fetchUsers]);

  const handleResetPassword = async (userId: string, email: string) => {
    try {
      const result = await resetPassword(userId);
      setResetModal({ open: true, password: result.temp_password, email });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to reset password" });
    }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      await toggleActive(userId);
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: "User status updated" });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to update user status" });
    }
  };

  // Client-side role filter
  const filteredUserIds = userIds.filter((id) => {
    if (!roleFilter) return true;
    const user = users[id];
    if (!user) return false;
    if (roleFilter === "super_admin") return user.admin_role === 30;
    if (roleFilter === "workspace_admin") return user.admin_role === 20;
    if (roleFilter === "user") return !user.admin_role;
    return true;
  });

  return (
    <PageWrapper
      header={{
        title: "User Management",
        description: "Create and manage user accounts on this instance.",
        actions: (
          <div className="flex items-center gap-2">
            <Link href="/users/import" className={getButtonStyling("secondary", "base")}>
              <Upload className="h-4 w-4" />
              Import
            </Link>
            <Link href="/users/create" className={getButtonStyling("primary", "base")}>
              <UserPlus className="h-4 w-4" />
              Create User
            </Link>
          </div>
        ),
      }}
    >
      <div className="space-y-4">
        {/* Search + Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-md border border-subtle bg-surface-1 py-2 pl-10 pr-4 text-sm text-primary placeholder:text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border border-subtle bg-surface-1 px-3 py-2 text-sm text-primary focus:border-primary focus:outline-none"
          >
            {ROLE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" size="base" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* User list */}
        {loader !== "init-loader" ? (
          <>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <span className="font-medium">{filteredUserIds.length} users</span>
              {roleFilter && <span className="text-tertiary">({userIds.length} total)</span>}
              {loader && ["mutation", "pagination"].includes(loader) && (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              )}
            </div>

            <div className="overflow-hidden rounded-lg border border-subtle">
              <table className="w-full">
                <thead className="bg-surface-2">
                  <tr className="text-left text-xs font-medium text-secondary">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {filteredUserIds.map((userId) => {
                    const user = users[userId];
                    if (!user) return null;
                    return (
                      <tr key={userId} className="hover:bg-surface-2">
                        <td className="px-4 py-3">
                          <Link href={`/users/${userId}`} className="text-sm font-medium text-primary hover:underline">
                            {user.display_name || `${user.first_name} ${user.last_name}`.trim() || "-"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-tertiary font-mono">{user.username}</td>
                        <td className="px-4 py-3 text-sm text-secondary">{user.email}</td>
                        <td className="px-4 py-3">
                          <RoleBadge user={user} />
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                              user.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            )}
                          >
                            {user.is_active ? (
                              <>
                                <UserCheck className="h-3 w-3" /> Active
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3" /> Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary">
                          {user.last_active ? new Date(user.last_active).toLocaleDateString() : "Never"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleResetPassword(userId, user.email)}
                              className="rounded p-1.5 text-secondary hover:bg-surface-3 hover:text-primary"
                              title="Reset password"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(userId)}
                              className={cn(
                                "rounded p-1.5 hover:bg-surface-3",
                                user.is_active
                                  ? "text-red-500 hover:text-red-600"
                                  : "text-green-500 hover:text-green-600"
                              )}
                              title={user.is_active ? "Deactivate" : "Activate"}
                            >
                              {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUserIds.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-secondary">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {hasNextPage && (
              <div className="flex justify-center">
                <Button variant="link" size="lg" onClick={() => fetchNextUsers()} disabled={loader === "pagination"}>
                  Load more
                  {loader === "pagination" && <LoaderIcon className="h-3 w-3 animate-spin" />}
                </Button>
              </div>
            )}
          </>
        ) : (
          <Loader className="space-y-4 py-4">
            <Loader.Item height="40px" width="100%" />
            <Loader.Item height="40px" width="100%" />
            <Loader.Item height="40px" width="100%" />
            <Loader.Item height="40px" width="100%" />
          </Loader>
        )}
      </div>

      <TempPasswordModal
        isOpen={resetModal.open}
        onClose={() => setResetModal({ open: false, password: "", email: "" })}
        password={resetModal.password}
        email={resetModal.email}
      />
    </PageWrapper>
  );
});

export const meta: Route.MetaFunction = () => [{ title: "User Management - God Mode" }];

export default UserManagementPage;
