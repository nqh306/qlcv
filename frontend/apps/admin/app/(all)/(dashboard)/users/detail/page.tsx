import { useState } from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { RotateCcw, UserCheck, UserX, ArrowLeft, Shield, ShieldCheck, Plus, Trash2 } from "lucide-react";
import { Button } from "@plane/propel/button";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { Loader } from "@plane/ui";
import { cn } from "@plane/utils";
import { InstanceUserService } from "@plane/services";
import type { IInstanceManagedUser, IWorkspaceProject } from "@plane/types";
import { PageWrapper } from "@/components/common/page-wrapper";
import { TempPasswordModal } from "@/components/users/temp-password-modal";
import { useUser, useUserManagement, useWorkspace } from "@/hooks/store";
import type { Route } from "./+types/page";

const userService = new InstanceUserService();

function AdminRoleDisplay({ user }: { user: IInstanceManagedUser }) {
  if (user.admin_role === 30) {
    return (
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Super Admin</span>
        </div>
        <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
          Full access to all instance settings and all workspaces.
        </p>
      </div>
    );
  }
  if (user.admin_role === 20) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Workspace Admin</span>
        </div>
        {user.admin_scoped_workspaces.length > 0 ? (
          <div className="mt-2">
            <p className="text-xs text-blue-600 dark:text-blue-400">Manages users in:</p>
            <ul className="mt-1 space-y-1">
              {user.admin_scoped_workspaces.map((ws) => (
                <li key={ws} className="text-xs font-medium text-blue-800 dark:text-blue-300">
                  {ws}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">No workspaces assigned yet.</p>
        )}
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-subtle bg-surface-2 p-4">
      <span className="text-sm text-secondary">Regular User</span>
      <p className="mt-1 text-xs text-tertiary">No admin privileges.</p>
    </div>
  );
}

const ROLE_LABELS: Record<number, string> = { 20: "Admin", 15: "Member", 5: "Guest" };

const UserDetailPage = observer(function UserDetailPage({ params }: Route.ComponentProps) {
  const { push } = useRouter();
  const { isSuperAdmin, currentUser } = useUser();
  const { resetPassword, toggleActive, assignWorkspace, removeWorkspace } = useUserManagement();
  const { workspaces, fetchWorkspaces } = useWorkspace();

  const userId = params.userId;

  const { data: user, mutate } = useSWR(userId ? `USER_DETAIL_${userId}` : null, () =>
    userService.getUserDetail(userId)
  );
  useSWR("INSTANCE_WORKSPACES_FOR_DETAIL", () => fetchWorkspaces());

  const [resetModal, setResetModal] = useState<{ open: boolean; password: string; email: string }>({
    open: false,
    password: "",
    email: "",
  });

  // Add workspace form state
  const [addWsSlug, setAddWsSlug] = useState("");
  const [addWsRole, setAddWsRole] = useState(15);
  const [isAssigning, setIsAssigning] = useState(false);

  // Add project form state
  const [addProjWsSlug, setAddProjWsSlug] = useState("");
  const [addProjId, setAddProjId] = useState("");
  const [addProjRole, setAddProjRole] = useState(15);
  const [isAssigningProject, setIsAssigningProject] = useState(false);
  const [wsProjects, setWsProjects] = useState<IWorkspaceProject[]>([]);

  // Admin role management state
  const [adminRoleEdit, setAdminRoleEdit] = useState(false);
  const [newAdminRole, setNewAdminRole] = useState<number | null>(null);
  const [adminWsIds, setAdminWsIds] = useState<string[]>([]);
  const [isSavingRole, setIsSavingRole] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Partial<IInstanceManagedUser>>({
    values: user
      ? { username: user.username, first_name: user.first_name, last_name: user.last_name, display_name: user.display_name }
      : undefined,
  });

  const onSubmit = async (data: Partial<IInstanceManagedUser>) => {
    try {
      await userService.updateUser(userId, data);
      mutate();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: "User updated" });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to update user" });
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    try {
      const result = await resetPassword(userId);
      setResetModal({ open: true, password: result.temp_password, email: user.email });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to reset password" });
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;
    try {
      await toggleActive(userId);
      mutate();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: "User status updated" });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to update status" });
    }
  };

  const handleAssignWorkspace = async () => {
    if (!addWsSlug) return;
    setIsAssigning(true);
    try {
      await assignWorkspace(userId, addWsSlug, addWsRole);
      mutate();
      setAddWsSlug("");
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: "Workspace assigned" });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to assign workspace" });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveWorkspace = async (slug: string, name: string) => {
    if (!confirm(`Remove user from "${name}"?`)) return;
    try {
      await removeWorkspace(userId, slug);
      mutate();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: `Removed from ${name}` });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to remove from workspace" });
    }
  };

  const handleLoadProjects = async (wsSlug: string) => {
    setAddProjWsSlug(wsSlug);
    setAddProjId("");
    if (!wsSlug) { setWsProjects([]); return; }
    try {
      const projects = await userService.listUserProjects(userId, wsSlug);
      setWsProjects(projects);
    } catch {
      setWsProjects([]);
    }
  };

  const handleAssignProject = async () => {
    if (!addProjId) return;
    setIsAssigningProject(true);
    try {
      await userService.assignProject(userId, { project_id: addProjId, role: addProjRole });
      mutate();
      handleLoadProjects(addProjWsSlug);
      setAddProjId("");
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: "Project assigned" });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to assign project" });
    } finally {
      setIsAssigningProject(false);
    }
  };

  const handleRemoveProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Remove user from project "${projectName}"?`)) return;
    try {
      await userService.removeProject(userId, projectId);
      mutate();
      if (addProjWsSlug) handleLoadProjects(addProjWsSlug);
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: `Removed from ${projectName}` });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to remove from project" });
    }
  };

  const handleStartEditRole = () => {
    setAdminRoleEdit(true);
    setNewAdminRole(user?.admin_role ?? null);
    setAdminWsIds([]);
  };

  const handleSaveAdminRole = async () => {
    setIsSavingRole(true);
    try {
      await userService.setAdminRole(userId, {
        role: newAdminRole === 0 ? null : newAdminRole,
        workspace_ids: newAdminRole === 20 ? adminWsIds : [],
      });
      mutate();
      setAdminRoleEdit(false);
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: "Admin role updated" });
    } catch (err: any) {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: err?.data?.error || "Failed to update role" });
    } finally {
      setIsSavingRole(false);
    }
  };

  if (!user) {
    return (
      <PageWrapper header={{ title: "User Detail", description: "Loading..." }}>
        <Loader className="space-y-4">
          <Loader.Item height="40px" width="50%" />
          <Loader.Item height="40px" width="50%" />
          <Loader.Item height="40px" width="50%" />
        </Loader>
      </PageWrapper>
    );
  }

  // Workspaces user is NOT in yet (for "Add" dropdown)
  const memberSlugs = new Set((user.workspace_memberships ?? []).map((m) => m.workspace_slug));
  const availableWorkspaces = Object.values(workspaces).filter((ws) => !memberSlugs.has(ws.slug));

  return (
    <PageWrapper
      header={{
        title: user.display_name || user.email,
        description: user.email,
        actions: (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="base" onClick={handleResetPassword}>
              <RotateCcw className="h-4 w-4" />
              Reset Password
            </Button>
            <Button
              variant={user.is_active ? "error-fill" : "primary"}
              size="base"
              onClick={handleToggleActive}
            >
              {user.is_active ? (
                <>
                  <UserX className="h-4 w-4" /> Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" /> Activate
                </>
              )}
            </Button>
          </div>
        ),
      }}
    >
      <div className="max-w-2xl space-y-8">
        <button onClick={() => push("/users/")} className="flex items-center gap-1 text-sm text-secondary hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to users
        </button>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              user.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {user.is_active ? "Active" : "Inactive"}
          </span>
          {user.is_password_reset_required && (
            <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Password reset required
            </span>
          )}
        </div>

        {/* Admin Role Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-primary">Admin Role</h3>
            {isSuperAdmin && !adminRoleEdit && currentUser?.id !== userId && (
              <button
                onClick={handleStartEditRole}
                className="text-xs text-link-primary hover:underline"
              >
                Change role
              </button>
            )}
          </div>

          {adminRoleEdit ? (
            <div className="rounded-lg border border-subtle bg-surface-2 p-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-secondary">Role</label>
                <select
                  value={newAdminRole ?? 0}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setNewAdminRole(v === 0 ? null : v);
                    setAdminWsIds([]);
                  }}
                  className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-sm text-primary focus:border-primary focus:outline-none"
                >
                  <option value={0}>Regular User (no admin)</option>
                  <option value={20}>Workspace Admin</option>
                  <option value={30}>Super Admin</option>
                </select>
              </div>

              {newAdminRole === 20 && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-secondary">Workspace(s) to manage</label>
                  <select
                    multiple
                    value={adminWsIds}
                    onChange={(e) => setAdminWsIds(Array.from(e.target.selectedOptions, (o) => o.value))}
                    className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-sm text-primary focus:border-primary focus:outline-none"
                    size={Math.min(Object.keys(workspaces).length, 5) || 1}
                  >
                    {Object.values(workspaces).map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-tertiary">Hold Ctrl/Cmd to select multiple.</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="base"
                  onClick={handleSaveAdminRole}
                  disabled={isSavingRole || (newAdminRole === 20 && adminWsIds.length === 0)}
                >
                  {isSavingRole ? "Saving..." : "Save"}
                </Button>
                <Button variant="secondary" size="base" onClick={() => setAdminRoleEdit(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <AdminRoleDisplay user={user} />
          )}
        </div>

        {/* Profile Edit form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-sm font-medium text-primary">Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">Username</label>
              <input
                type="text"
                {...register("username")}
                className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-sm font-mono text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">Email</label>
              <input
                type="text"
                value={user.email}
                disabled
                className="w-full rounded-md border border-subtle bg-surface-2 px-3 py-2 text-sm text-tertiary cursor-not-allowed"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">First Name</label>
              <input
                type="text"
                {...register("first_name")}
                className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-sm text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">Last Name</label>
              <input
                type="text"
                {...register("last_name")}
                className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-sm text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary">Display Name</label>
            <input
              type="text"
              {...register("display_name")}
              className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-sm text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <Button type="submit" variant="primary" size="base" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>

        {/* Workspace Memberships — editable */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-primary">Workspace Memberships</h3>

          {user.workspace_memberships && user.workspace_memberships.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-subtle">
              <table className="w-full text-sm">
                <thead className="bg-surface-2">
                  <tr className="text-left text-xs font-medium text-secondary">
                    <th className="px-4 py-2">Workspace</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {user.workspace_memberships.map((m) => (
                    <tr key={m.workspace_id}>
                      <td className="px-4 py-2 text-primary">{m.workspace_name}</td>
                      <td className="px-4 py-2 text-secondary">{ROLE_LABELS[m.role] ?? `Role ${m.role}`}</td>
                      <td className="px-4 py-2">
                        <span className={cn("text-xs", m.is_active ? "text-green-600" : "text-red-600")}>
                          {m.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleRemoveWorkspace(m.workspace_slug, m.workspace_name)}
                          className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          title="Remove from workspace"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-tertiary">Not a member of any workspace.</p>
          )}

          {/* Add to workspace */}
          {availableWorkspaces.length > 0 && (
            <div className="flex items-end gap-2 rounded-lg border border-dashed border-subtle p-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-secondary">Add to workspace</label>
                <select
                  value={addWsSlug}
                  onChange={(e) => setAddWsSlug(e.target.value)}
                  className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-sm text-primary focus:border-primary focus:outline-none"
                >
                  <option value="">Select workspace...</option>
                  {availableWorkspaces.map((ws) => (
                    <option key={ws.id} value={ws.slug}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-secondary">Role</label>
                <select
                  value={addWsRole}
                  onChange={(e) => setAddWsRole(Number(e.target.value))}
                  className="rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-sm text-primary focus:border-primary focus:outline-none"
                >
                  <option value={20}>Admin</option>
                  <option value={15}>Member</option>
                  <option value={5}>Guest</option>
                </select>
              </div>
              <Button
                variant="primary"
                size="base"
                onClick={handleAssignWorkspace}
                disabled={!addWsSlug || isAssigning}
              >
                <Plus className="h-4 w-4" />
                {isAssigning ? "Adding..." : "Add"}
              </Button>
            </div>
          )}
        </div>

        {/* Project Memberships — editable */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-primary">Project Memberships</h3>

          {user.project_memberships && user.project_memberships.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-subtle">
              <table className="w-full text-sm">
                <thead className="bg-surface-2">
                  <tr className="text-left text-xs font-medium text-secondary">
                    <th className="px-4 py-2">Project</th>
                    <th className="px-4 py-2">Workspace</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {user.project_memberships.map((m) => (
                    <tr key={m.project_id}>
                      <td className="px-4 py-2 text-primary">
                        {m.project_name} <span className="text-tertiary">({m.project_identifier})</span>
                      </td>
                      <td className="px-4 py-2 text-secondary">{m.workspace_slug}</td>
                      <td className="px-4 py-2 text-secondary">{ROLE_LABELS[m.role] ?? `Role ${m.role}`}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleRemoveProject(m.project_id, m.project_name)}
                          className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          title="Remove from project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-tertiary">Not assigned to any project.</p>
          )}

          {/* Add to project */}
          <div className="rounded-lg border border-dashed border-subtle p-3 space-y-2">
            <label className="block text-xs font-medium text-secondary">Add to project</label>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-tertiary">Workspace</label>
                <select
                  value={addProjWsSlug}
                  onChange={(e) => handleLoadProjects(e.target.value)}
                  className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-sm text-primary focus:border-primary focus:outline-none"
                >
                  <option value="">Select workspace...</option>
                  {(user.workspace_memberships ?? []).map((m) => (
                    <option key={m.workspace_id} value={m.workspace_slug}>
                      {m.workspace_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-tertiary">Project</label>
                <select
                  value={addProjId}
                  onChange={(e) => setAddProjId(e.target.value)}
                  className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-sm text-primary focus:border-primary focus:outline-none"
                  disabled={!addProjWsSlug}
                >
                  <option value="">Select project...</option>
                  {wsProjects.filter((p) => !p.is_member).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.identifier})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-tertiary">Role</label>
                <select
                  value={addProjRole}
                  onChange={(e) => setAddProjRole(Number(e.target.value))}
                  className="rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-sm text-primary focus:border-primary focus:outline-none"
                >
                  <option value={20}>Admin</option>
                  <option value={15}>Member</option>
                  <option value={5}>Guest</option>
                </select>
              </div>
              <Button
                variant="primary"
                size="base"
                onClick={handleAssignProject}
                disabled={!addProjId || isAssigningProject}
              >
                <Plus className="h-4 w-4" />
                {isAssigningProject ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-2 text-sm text-secondary">
          <h3 className="font-medium text-primary">Account Info</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-tertiary">Email verified:</span> {user.is_email_verified ? "Yes" : "No"}
            </div>
            <div>
              <span className="text-tertiary">Timezone:</span> {user.user_timezone || "UTC"}
            </div>
            <div>
              <span className="text-tertiary">Joined:</span> {new Date(user.date_joined).toLocaleDateString()}
            </div>
            {user.last_active && (
              <div>
                <span className="text-tertiary">Last active:</span> {new Date(user.last_active).toLocaleString()}
              </div>
            )}
            {user.last_login_time && (
              <div>
                <span className="text-tertiary">Last login:</span> {new Date(user.last_login_time).toLocaleString()}
              </div>
            )}
            {user.mobile_number && (
              <div>
                <span className="text-tertiary">Mobile:</span> {user.mobile_number}
              </div>
            )}
          </div>
        </div>
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

export const meta: Route.MetaFunction = () => [{ title: "User Detail - God Mode" }];

export default UserDetailPage;
