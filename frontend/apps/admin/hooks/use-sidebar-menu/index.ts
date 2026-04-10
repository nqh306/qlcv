import { useTranslation } from "@qlcv/i18n";
import { useUser } from "@/hooks/store";
import { getCoreSidebarMenuLinks } from "./core";
import type { TSidebarMenuItem } from "./types";

export function useSidebarMenu(): TSidebarMenuItem[] {
  const { isSuperAdmin } = useUser();
  const { t } = useTranslation();

  const links = getCoreSidebarMenuLinks(t);

  if (isSuperAdmin) {
    return [
      links.general,
      links.email,
      links.authentication,
      links.organizations,
      links.users,
      links.ai,
      links.image,
    ];
  }

  // Workspace Admin: only Users page
  return [links.users];
}
