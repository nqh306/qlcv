import { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { Check, X } from "lucide-react";
import { useTranslation } from "@qlcv/i18n";
import { Button } from "@qlcv/propel/button";
import { setToast, TOAST_TYPE } from "@qlcv/propel/toast";
import { InstanceUserService } from "@qlcv/services";
import { PageWrapper } from "@/components/common/page-wrapper";
import { TempPasswordModal } from "@/components/users/temp-password-modal";
import { useUser, useUserManagement, useWorkspace } from "@/hooks/store";
import type { Route } from "./+types/page";

const checkService = new InstanceUserService();

type FormData = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  workspace_slugs: string[];
  role: number;
};

function useAvailabilityCheck(field: "username" | "email", value: string, minLength = 3) {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");

  useEffect(() => {
    if (!value || value.length < minLength) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await checkService.checkAvailability({ [field]: value });
        if (result.error) setStatus("invalid");
        else setStatus(result.available ? "available" : "taken");
      } catch {
        setStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [field, value, minLength]);

  return status;
}

function AvailabilityIndicator({
  status,
  t,
}: {
  status: "idle" | "checking" | "available" | "taken" | "invalid";
  t: (key: string) => string;
}) {
  if (status === "idle") return null;
  if (status === "checking") return <span className="text-12 text-tertiary">{t("admin.common.loading")}</span>;
  if (status === "available")
    return (
      <span className="inline-flex items-center gap-1 text-12 text-green-600">
        <Check className="h-3 w-3" /> {t("admin.common.success")}
      </span>
    );
  if (status === "taken")
    return (
      <span className="inline-flex items-center gap-1 text-12 text-red-500">
        <X className="h-3 w-3" /> {t("admin.common.error")}
      </span>
    );
  return <span className="text-12 text-red-500">{t("admin.common.error")}</span>;
}

const CreateUserPage = observer(function CreateUserPage(_props: Route.ComponentProps) {
  const { push } = useRouter();
  const { t } = useTranslation();
  const { isSuperAdmin, scopedWorkspaceIds } = useUser();
  const { createUser } = useUserManagement();
  const { workspaces, fetchWorkspaces } = useWorkspace();
  const [tempPasswordModal, setTempPasswordModal] = useState<{ open: boolean; password: string; email: string }>({
    open: false,
    password: "",
    email: "",
  });

  useSWR("INSTANCE_WORKSPACES", () => fetchWorkspaces());

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      workspace_slugs: [],
      role: 15,
    },
  });

  const watchUsername = watch("username");
  const watchEmail = watch("email");
  const usernameStatus = useAvailabilityCheck("username", watchUsername);
  const emailStatus = useAvailabilityCheck("email", watchEmail);

  const availableWorkspaces = Object.values(workspaces).filter((ws) => {
    if (isSuperAdmin) return true;
    return scopedWorkspaceIds.includes(ws.id);
  });

  const canSubmit =
    usernameStatus !== "taken" && usernameStatus !== "invalid" && usernameStatus !== "checking" &&
    emailStatus !== "taken" && emailStatus !== "invalid" && emailStatus !== "checking";

  const onSubmit = async (data: FormData) => {
    if (!canSubmit) return;
    try {
      const result = await createUser(data);
      setTempPasswordModal({ open: true, password: result.temp_password, email: data.email });
      reset();
    } catch (error: any) {
      const message = error?.data?.error || t("admin.page.users.toast.created_error");
      setToast({ type: TOAST_TYPE.ERROR, title: t("admin.common.error"), message });
    }
  };

  return (
    <PageWrapper
      header={{
        title: t("admin.page.users.create.title"),
        description: t("admin.page.users.create.description"),
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-14 font-medium text-primary">{t("admin.page.users.create.username_label")} *</label>
              <AvailabilityIndicator status={usernameStatus} t={t} />
            </div>
            <input
              type="text"
              {...register("username", {
                required: t("admin.common.required"),
                pattern: { value: /^[a-zA-Z0-9._-]+$/, message: t("admin.page.users.create.username_help") },
                minLength: { value: 3, message: t("admin.page.users.create.username_help") },
                maxLength: { value: 64, message: t("admin.page.users.create.username_help") },
              })}
              className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-14 text-primary placeholder:text-tertiary focus:border-primary focus:outline-none"
              placeholder={t("admin.page.users.create.username_placeholder")}
            />
            {errors.username && <p className="mt-1 text-12 text-red-500">{errors.username.message}</p>}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-14 font-medium text-primary">{t("admin.page.users.create.email_label")} *</label>
              <AvailabilityIndicator status={emailStatus} t={t} />
            </div>
            <input
              type="email"
              {...register("email", { required: t("admin.common.required") })}
              className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-14 text-primary placeholder:text-tertiary focus:border-primary focus:outline-none"
              placeholder={t("admin.page.users.create.email_placeholder")}
            />
            {errors.email && <p className="mt-1 text-12 text-red-500">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-14 font-medium text-primary">
                {t("admin.page.users.create.first_name_label")}
              </label>
              <input
                type="text"
                {...register("first_name")}
                className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-14 text-primary placeholder:text-tertiary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-14 font-medium text-primary">
                {t("admin.page.users.create.last_name_label")}
              </label>
              <input
                type="text"
                {...register("last_name")}
                className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-14 text-primary placeholder:text-tertiary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-14 font-medium text-primary">
              {t("admin.page.users.create.organizations_label")}
            </label>
            <select
              multiple
              {...register("workspace_slugs")}
              className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-14 text-primary focus:border-primary focus:outline-none"
              size={Math.min(availableWorkspaces.length, 5) || 1}
            >
              {availableWorkspaces.map((ws) => (
                <option key={ws.id} value={ws.slug}>
                  {ws.name} ({ws.slug})
                </option>
              ))}
            </select>
            <p className="mt-1 text-12 text-tertiary">{t("admin.page.users.create.organizations_help")}</p>
          </div>

          <div>
            <label className="mb-1 block text-14 font-medium text-primary">
              {t("admin.page.users.create.role_in_organization_label")}
            </label>
            <select
              {...register("role", { valueAsNumber: true })}
              className="w-full rounded-md border border-subtle bg-surface-1 px-3 py-2 text-14 text-primary focus:border-primary focus:outline-none"
            >
              <option value={20}>{t("admin.page.users.create.role_admin")}</option>
              <option value={15}>{t("admin.page.users.create.role_member")}</option>
              <option value={5}>{t("admin.page.users.create.role_guest")}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="base" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? t("admin.common.saving") : t("admin.page.users.create.submit")}
          </Button>
          <Button type="button" variant="secondary" size="base" onClick={() => push("/users/")}>
            {t("admin.common.cancel")}
          </Button>
        </div>
      </form>

      <TempPasswordModal
        isOpen={tempPasswordModal.open}
        onClose={() => {
          setTempPasswordModal({ open: false, password: "", email: "" });
          push("/users/");
        }}
        password={tempPasswordModal.password}
        email={tempPasswordModal.email}
      />
    </PageWrapper>
  );
});

export const meta: Route.MetaFunction = () => [{ title: "Create User - God Mode" }];

export default CreateUserPage;
