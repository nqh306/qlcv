import { useState } from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { RotateCcw, UserCheck, UserX, ArrowLeft, Shield, ShieldCheck, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "@qlcv/i18n";
import { Button } from "@qlcv/propel/button";
import { setToast, TOAST_TYPE } from "@qlcv/propel/toast";
import { Loader } from "@qlcv/ui";
import { cn } from "@qlcv/utils";
import { InstanceUserService } from "@qlcv/services";
import type { IInstanceManagedUser, IWorkspaceProject } from "@qlcv/types";
import { PageWrapper } from "@/components/common/page-wrapper";
import { TempPasswordModal } from "@/components/users/temp-password-modal";
import { useUser, useUserManagement, useWorkspace } from "@/hooks/store";
import type { Route } from "./+types/page";

const userService = new InstanceUserService();

function AdminRoleDisplay({ user, t }: { user: IInstanceManagedUser; t: (key: string) => string }) {
  if (user.admin_role === 30) {
    return (
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="text-14 font-medium text-purple-800 dark:text-purple-300">
            {t("admin.page.users.role.super_admin")}
          </span>
        </div>
        <p className="mt-1 text-12 text-purple-600 dark:text-purple-400">
          {t("admin.page.users.role.super_admin_desc")}
        </p>
      </div>
    );
  }
  if (user.admin_role === 20) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-14 font-medium text-blue-800 dark:text-blue-300">
            {t("admin.page.users.role.workspace_admin")}
          </span>
        </div>
        {user.admin_scoped_workspaces.length > 0 ? (
          <div className="mt-2">
            <p className="text-12 text-blue-600 dark:text-blue-400">{t("admin.page.users.role.manages_units")}</p>
            <ul className="mt-1 space-y-1">
              {user.admin_scoped_workspaces.map((ws) => (
                <li key={ws} className="text-12 font-medium text-blue-800 dark:text-blue-300">
                  {ws}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-1 text-12 text-blue-600 dark:text-blue-400">
            {t("admin.page.users.role.no_units_assigned")}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-subtle bg-surface-2 p-4">
      <span className="text-14 text-secondary">{t("admin.page.users.role.regular_user")}</span>
      <p className="mt-1 text-12 text-tertiary">{t("admin.page.users.role.no_admin_privileges")}</p>
    </div>
  );
}

const UserDetailPage = observer(function UserDetailPage({ params }: Route.ComponentProps) {
  const { push } = useRouter();
  const { t } = useTranslation();

  const ROLE_LABELS: Record<number, string> = {
    20: t("admin.page.users.create.role_admin"),
    15: t("admin.page.users.create.role_member"),
    5: t("admin.page.users.create.role_guest"),
  };
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
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("admin.common.success"),
        message: t("admin.page.users.toast.updated_success"),
      });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("admin.common.error"),
        message: t("admin.page.users.toast.updated_error"),
      });
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    try {
      const result = await resetPassword(userId);
      setResetModal({ open: true, password: result.temp_password, email: user.email });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("admin.common.error"),
        message: t("admin.page.users.toast.password_reset_error"),
      });
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;
    try {
      await toggleActive(userId);
      mutate();
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("admin.common.success"),
        message: t("admin.page.users.toast.updated_success"),
      });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("admin.common.error"),
        message: t("admin.page.users.toast.updated_error"),
      });
    }
  };

  const handleAssignWorkspace = async () => {
    if (!addWsSlug) return;
    setIsAssigning(true);
    try {
      await assignWorkspace(userId, addWsSlug, addWsRole);
      mutate();
      setAddWsSlug("");
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("admin.common.success"),
        message: t("admin.page.users.toast.assigned_to_organization"),
      });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("admin.common.error"),
        message: t("admin.page.users.toast.updated_error"),
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveWorkspace = async (slug: string, name: string) => {
    if (!confirm(`${t("admin.common.remove")} "${name}"?`)) return;
    try {
      await removeWorkspace(userId, slug);
      mutate();
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("admin.common.success"),
        message: t("admin.page.users.toast.removed_from_organization"),
      });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("admin.common.error"),
        message: t("admin.page.users.toast.updated_error"),
      });
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
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("admin.common.success"),
        message: t("admin.page.users.toast.assigned_to_organization"),
      });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("admin.common.error"),
        message: t("admin.page.users.toast.updated_error"),
      });
    } finally {
      setIsAssigningProject(false);
    }
  };

  const handleRemoveProject = async (projectId: string, projectName: string) => {
    if (!confirm(`${t("admin.common.remove")} "${projectName}"?`)) return;
    try {
      await userService.removeProject(userId, projectId);
      mutate();
      if (addProjWsSlug) handleLoadProjects(addProjWsSlug);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("admin.common.success"),
        message: t("admin.page.users.toast.removed_from_organization"),
      });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("admin.common.error"),
        message: t("admin.page.users.toast.updated_error"),
      });
    }
  };

  const handleStartEditRole = () => {
    setAdminRoleEdit(true);
    setNewAdminRole(user?.admin_role ?? null);
  };

  const handleSaveAdminRole = async () => {
    setIsSavingRole(true);
    try {
      await userService.setAdminRole(userId, {
        role: newAdminRole === 30 ? 30 : null,
      });
      mutate();
      setAdminRoleEdit(false);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("admin.common.success"),
        message: t("admin.page.users.toast.role_updated"),
      });
    } catch (err: any) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("admin.common.error"),
        message: err?.data?.error || t("admin.page.users.toast.updated_error"),
      });
    } finally {
      setIsSavingRole(false);
    }
  };

  if (!user) {
    return (
      <PageWrapper header={{ title: t("admin.header.user"), description: t("admin.page.users.detail.loading") }}>
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
              {t("admin.page.users.actions.reset_password")}
            </Button>
            <Button
              variant={user.is_active ? "error-fill" : "primary"}
              size="base"
              onClick={handleToggleActive}
            >
              {user.is_active ? (
                <>
                  <UserX className="h-4 w-4" /> {t("admin.page.users.actions.deactivate")}
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" /> {t("admin.page.users.actions.activate")}
                </>
              )}
            </Button>
          </div>
        ),
      }}
    >
      <div className="max-w-2xl space-y-8">
        <button onClick={() => push("/users/")} className="flex items-center gap-1 text-14 text-secondary hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> {t("admin.page.users.detail.back")}
        </button>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-12 font-medium",
              user.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {user.is_active ? t("admin.page.users.status.active") : t("admin.page.users.status.inactive")}
          </span>
          {user.is_password_reset_required && (
            <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-12 font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              {t("admin.page.users.status.password_reset_required")}
            </span>
          )}
        </div>

        {/* Admin Role Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-14 font-medium text-primary">{t("admin.page.users.detail.admin_role_section")}</h3>
            {isSuperAdmin && !adminRoleEdit && currentUser?.id !== userId && (
              <button
                onClick={handleStartEditRole}
                className="text-12 text-link-primary hover:underline"
              >
                {t("admin.page.users.detail.change_role")}
              </button>
            )}
          </div>

          {adminRoleEdit ? (
            <div className="rounded-lg border border-subtle bg-surface-2 p-4 space-y-3">
              <div>
                <label className="mb-1 block text-12 font-medium text-secondary">
                  {t("admin.page.users.detail.super_admin_question")}
                </label>
                <select
                  value={newAdminRole === 30 ? 30 : 0}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setNewAdminRole(v === 30 ? 30 : null);
                  }}
                  className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-14 text-primary focus:border-primary focus:outline-none"
                >
                  <option value={0}>{t("admin.page.users.detail.super_admin_no")}</option>
                  <option value={30}>{t("admin.page.users.detail.super_admin_yes")}</option>
                </select>
                <p className="mt-1 text-12 text-tertiary">{t("admin.page.users.detail.set_workspace_admin_help")}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="base"
                  onClick={handleSaveAdminRole}
                  disabled={isSavingRole}
                >
                  {isSavingRole ? t("admin.common.saving") : t("admin.common.save")}
                </Button>
                <Button variant="secondary" size="base" onClick={() => setAdminRoleEdit(false)}>
                  {t("admin.common.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <AdminRoleDisplay user={user} t={t} />
          )}
        </div>

        {/* Profile Edit form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-14 font-medium text-primary">{t("admin.page.users.detail.profile_section")}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-14 font-medium text-secondary">
                {t("admin.page.users.create.username_label")}
              </label>
              <input
                type="text"
                {...register("username")}
                className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-14 font-mono text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-14 font-medium text-secondary">
                {t("admin.page.users.create.email_label")}
              </label>
              <input
                type="text"
                value={user.email}
                disabled
                className="w-full rounded-md border border-subtle bg-surface-2 px-3 py-2 text-14 text-tertiary cursor-not-allowed"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-14 font-medium text-secondary">
                {t("admin.page.users.create.first_name_label")}
              </label>
              <input
                type="text"
                {...register("first_name")}
                className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-14 text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-14 font-medium text-secondary">
                {t("admin.page.users.create.last_name_label")}
              </label>
              <input
                type="text"
                {...register("last_name")}
                className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-14 text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-14 font-medium text-secondary">Display Name</label>
            <input
              type="text"
              {...register("display_name")}
              className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-14 text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <Button type="submit" variant="primary" size="base" disabled={isSubmitting}>
            {isSubmitting ? t("admin.common.saving") : t("admin.common.save_changes")}
          </Button>
        </form>

        {/* Organization Memberships — editable */}
        <div className="space-y-3">
          <h3 className="text-14 font-medium text-primary">
            {t("admin.page.users.detail.organization_memberships")}
          </h3>

          {user.workspace_memberships && user.workspace_memberships.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-subtle">
              <table className="w-full text-14">
                <thead className="bg-surface-2">
                  <tr className="text-left text-12 font-medium text-secondary">
                    <th className="px-4 py-2">{t("admin.header.organization")}</th>
                    <th className="px-4 py-2">{t("admin.page.users.columns.role")}</th>
                    <th className="px-4 py-2">{t("admin.page.users.columns.status")}</th>
                    <th className="px-4 py-2 text-right">{t("admin.page.users.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {user.workspace_memberships.map((m) => (
                    <tr key={m.workspace_id}>
                      <td className="px-4 py-2 text-primary">{m.workspace_name}</td>
                      <td className="px-4 py-2">
                        <select
                          value={m.role}
                          onChange={(e) => assignWorkspace(userId, m.workspace_slug, Number(e.target.value)).then(mutate)}
                          className="rounded border border-subtle bg-surface-1 px-2 py-1 text-12 text-primary focus:border-primary focus:outline-none"
                        >
                          <option value={20}>{t("admin.page.users.create.role_admin")}</option>
                          <option value={15}>{t("admin.page.users.create.role_member")}</option>
                          <option value={5}>{t("admin.page.users.create.role_guest")}</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <span className={cn("text-12", m.is_active ? "text-green-600" : "text-red-600")}>
                          {m.is_active ? t("admin.page.users.status.active") : t("admin.page.users.status.inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleRemoveWorkspace(m.workspace_slug, m.workspace_name)}
                          className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          title={t("admin.common.remove")}
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
            <p className="text-14 text-tertiary">{t("admin.page.users.detail.not_a_member")}</p>
          )}

          {/* Add to organization */}
          {availableWorkspaces.length > 0 && (
            <div className="flex items-end gap-2 rounded-lg border border-dashed border-subtle p-3">
              <div className="flex-1">
                <label className="mb-1 block text-12 font-medium text-secondary">
                  {t("admin.page.users.detail.add_to_organization")}
                </label>
                <select
                  value={addWsSlug}
                  onChange={(e) => setAddWsSlug(e.target.value)}
                  className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-14 text-primary focus:border-primary focus:outline-none"
                >
                  <option value="">{t("admin.page.users.detail.select_organization")}</option>
                  {availableWorkspaces.map((ws) => (
                    <option key={ws.id} value={ws.slug}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-12 font-medium text-secondary">{t("admin.page.users.columns.role")}</label>
                <select
                  value={addWsRole}
                  onChange={(e) => setAddWsRole(Number(e.target.value))}
                  className="rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-14 text-primary focus:border-primary focus:outline-none"
                >
                  <option value={20}>{t("admin.page.users.create.role_admin")}</option>
                  <option value={15}>{t("admin.page.users.create.role_member")}</option>
                  <option value={5}>{t("admin.page.users.create.role_guest")}</option>
                </select>
              </div>
              <Button
                variant="primary"
                size="base"
                onClick={handleAssignWorkspace}
                disabled={!addWsSlug || isAssigning}
              >
                <Plus className="h-4 w-4" />
                {isAssigning ? t("admin.common.saving") : t("admin.common.add")}
              </Button>
            </div>
          )}
        </div>

        {/* Project Memberships — editable */}
        <div className="space-y-3">
          <h3 className="text-14 font-medium text-primary">{t("admin.page.users.detail.project_memberships")}</h3>

          {user.project_memberships && user.project_memberships.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-subtle">
              <table className="w-full text-14">
                <thead className="bg-surface-2">
                  <tr className="text-left text-12 font-medium text-secondary">
                    <th className="px-4 py-2">Project</th>
                    <th className="px-4 py-2">{t("admin.header.organization")}</th>
                    <th className="px-4 py-2">{t("admin.page.users.columns.role")}</th>
                    <th className="px-4 py-2 text-right">{t("admin.page.users.columns.actions")}</th>
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
                          title={t("admin.common.remove")}
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
            <p className="text-14 text-tertiary">{t("admin.common.no_data")}</p>
          )}

          {/* Add to project */}
          <div className="rounded-lg border border-dashed border-subtle p-3 space-y-2">
            <label className="block text-12 font-medium text-secondary">{t("admin.common.add")}</label>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-12 text-tertiary">{t("admin.header.organization")}</label>
                <select
                  value={addProjWsSlug}
                  onChange={(e) => handleLoadProjects(e.target.value)}
                  className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-14 text-primary focus:border-primary focus:outline-none"
                >
                  <option value="">{t("admin.page.users.detail.select_organization")}</option>
                  {(user.workspace_memberships ?? []).map((m) => (
                    <option key={m.workspace_id} value={m.workspace_slug}>
                      {m.workspace_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-12 text-tertiary">Project</label>
                <select
                  value={addProjId}
                  onChange={(e) => setAddProjId(e.target.value)}
                  className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-14 text-primary focus:border-primary focus:outline-none"
                  disabled={!addProjWsSlug}
                >
                  <option value="">{t("admin.page.users.detail.select_organization")}</option>
                  {wsProjects.filter((p) => !p.is_member).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.identifier})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-12 text-tertiary">{t("admin.page.users.columns.role")}</label>
                <select
                  value={addProjRole}
                  onChange={(e) => setAddProjRole(Number(e.target.value))}
                  className="rounded-md border border-subtle bg-surface-1 px-3 py-1.5 text-14 text-primary focus:border-primary focus:outline-none"
                >
                  <option value={20}>{t("admin.page.users.create.role_admin")}</option>
                  <option value={15}>{t("admin.page.users.create.role_member")}</option>
                  <option value={5}>{t("admin.page.users.create.role_guest")}</option>
                </select>
              </div>
              <Button
                variant="primary"
                size="base"
                onClick={handleAssignProject}
                disabled={!addProjId || isAssigningProject}
              >
                <Plus className="h-4 w-4" />
                {isAssigningProject ? t("admin.common.saving") : t("admin.common.add")}
              </Button>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-2 text-14 text-secondary">
          <h3 className="font-medium text-primary">{t("admin.page.users.detail.account_info")}</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-tertiary">{t("admin.page.users.detail.email_verified")}:</span>{" "}
              {user.is_email_verified ? t("admin.common.yes") : t("admin.common.no")}
            </div>
            <div>
              <span className="text-tertiary">{t("admin.page.users.detail.timezone")}:</span>{" "}
              {user.user_timezone || "UTC"}
            </div>
            <div>
              <span className="text-tertiary">{t("admin.page.users.detail.joined")}:</span>{" "}
              {new Date(user.date_joined).toLocaleDateString()}
            </div>
            {user.last_active && (
              <div>
                <span className="text-tertiary">{t("admin.page.users.columns.last_active")}:</span>{" "}
                {new Date(user.last_active).toLocaleString()}
              </div>
            )}
            {user.last_login_time && (
              <div>
                <span className="text-tertiary">{t("admin.page.users.detail.last_login")}:</span>{" "}
                {new Date(user.last_login_time).toLocaleString()}
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
