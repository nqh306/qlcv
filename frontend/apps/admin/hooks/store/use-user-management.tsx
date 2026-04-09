import { useContext } from "react";
import { StoreContext } from "@/providers/store.provider";
import type { IUserManagementStore } from "@/store/user-management.store";

export const useUserManagement = (): IUserManagementStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useUserManagement must be used within StoreProvider");
  return context.userManagement;
};
