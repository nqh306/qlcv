import { useUser } from "@/hooks/store";
import { coreSidebarMenuLinks } from "./core";
import type { TSidebarMenuItem } from "./types";

export function useSidebarMenu(): TSidebarMenuItem[] {
  const { isSuperAdmin } = useUser();

  if (isSuperAdmin) {
    return [
      coreSidebarMenuLinks.general,
      coreSidebarMenuLinks.email,
      coreSidebarMenuLinks.authentication,
      coreSidebarMenuLinks.workspace,
      coreSidebarMenuLinks.users,
      coreSidebarMenuLinks.ai,
      coreSidebarMenuLinks.image,
    ];
  }

  // Workspace Admin: only Users page
  return [coreSidebarMenuLinks.users];
}
