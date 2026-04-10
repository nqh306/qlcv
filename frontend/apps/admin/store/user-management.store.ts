import { set } from "lodash-es";
import { action, observable, runInAction, makeObservable, computed } from "mobx";
import { InstanceUserService } from "@qlcv/services";
import type {
  IInstanceManagedUser,
  ICreateUserPayload,
  ICreateUserResponse,
  IResetPasswordResponse,
  IBulkImportResult,
  TLoader,
  TPaginationInfo,
} from "@qlcv/types";
import type { RootStore } from "@/store/root.store";

export interface IUserManagementStore {
  // observables
  loader: TLoader;
  users: Record<string, IInstanceManagedUser>;
  paginationInfo: TPaginationInfo | undefined;
  searchQuery: string;
  workspaceFilter: string | undefined;
  // computed
  userIds: string[];
  // helper actions
  getUserById: (userId: string) => IInstanceManagedUser | undefined;
  setSearchQuery: (query: string) => void;
  setWorkspaceFilter: (slug: string | undefined) => void;
  // fetch actions
  fetchUsers: () => Promise<IInstanceManagedUser[]>;
  fetchNextUsers: () => Promise<IInstanceManagedUser[]>;
  // CRUD actions
  createUser: (data: ICreateUserPayload) => Promise<ICreateUserResponse>;
  updateUser: (userId: string, data: Partial<IInstanceManagedUser>) => Promise<IInstanceManagedUser>;
  resetPassword: (userId: string) => Promise<IResetPasswordResponse>;
  toggleActive: (userId: string) => Promise<IInstanceManagedUser>;
  assignWorkspace: (userId: string, workspaceSlug: string, role: number) => Promise<void>;
  removeWorkspace: (userId: string, workspaceSlug: string) => Promise<void>;
  bulkImport: (file: File) => Promise<IBulkImportResult>;
  clearUsers: () => void;
}

export class UserManagementStore implements IUserManagementStore {
  loader: TLoader = "init-loader";
  users: Record<string, IInstanceManagedUser> = {};
  paginationInfo: TPaginationInfo | undefined = undefined;
  searchQuery: string = "";
  workspaceFilter: string | undefined = undefined;
  // services
  userService;

  constructor(private store: RootStore) {
    makeObservable(this, {
      loader: observable,
      users: observable,
      paginationInfo: observable,
      searchQuery: observable.ref,
      workspaceFilter: observable.ref,
      userIds: computed,
      getUserById: action,
      setSearchQuery: action,
      setWorkspaceFilter: action,
      fetchUsers: action,
      fetchNextUsers: action,
      createUser: action,
      updateUser: action,
      resetPassword: action,
      toggleActive: action,
      assignWorkspace: action,
      removeWorkspace: action,
      bulkImport: action,
      clearUsers: action,
    });
    this.userService = new InstanceUserService();
  }

  get userIds() {
    return Object.keys(this.users);
  }

  getUserById = (userId: string) => this.users[userId];

  setSearchQuery = (query: string) => {
    this.searchQuery = query;
  };

  setWorkspaceFilter = (slug: string | undefined) => {
    this.workspaceFilter = slug;
  };

  clearUsers = () => {
    this.users = {};
    this.paginationInfo = undefined;
  };

  fetchUsers = async (): Promise<IInstanceManagedUser[]> => {
    try {
      this.loader = this.userIds.length > 0 ? "mutation" : "init-loader";
      this.users = {};
      const paginatedData = await this.userService.listUsers({
        search: this.searchQuery || undefined,
        workspace: this.workspaceFilter || undefined,
      });
      runInAction(() => {
        const { results, ...paginationInfo } = paginatedData;
        results.forEach((user: IInstanceManagedUser) => {
          set(this.users, [user.id], user);
        });
        set(this, "paginationInfo", paginationInfo);
      });
      return paginatedData.results;
    } catch (error) {
      console.error("Error fetching users", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loader = "loaded";
      });
    }
  };

  fetchNextUsers = async (): Promise<IInstanceManagedUser[]> => {
    if (!this.paginationInfo || this.paginationInfo.next_page_results === false) return [];
    try {
      this.loader = "pagination";
      const paginatedData = await this.userService.listUsers({
        cursor: this.paginationInfo.next_cursor,
        search: this.searchQuery || undefined,
        workspace: this.workspaceFilter || undefined,
      });
      runInAction(() => {
        const { results, ...paginationInfo } = paginatedData;
        results.forEach((user: IInstanceManagedUser) => {
          set(this.users, [user.id], user);
        });
        set(this, "paginationInfo", paginationInfo);
      });
      return paginatedData.results;
    } catch (error) {
      console.error("Error fetching next users", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loader = "loaded";
      });
    }
  };

  createUser = async (data: ICreateUserPayload): Promise<ICreateUserResponse> => {
    const response = await this.userService.createUser(data);
    runInAction(() => {
      set(this.users, [response.user.id], response.user);
    });
    return response;
  };

  updateUser = async (userId: string, data: Partial<IInstanceManagedUser>): Promise<IInstanceManagedUser> => {
    const user = await this.userService.updateUser(userId, data);
    runInAction(() => {
      set(this.users, [userId], user);
    });
    return user;
  };

  resetPassword = async (userId: string): Promise<IResetPasswordResponse> => {
    return await this.userService.resetPassword(userId);
  };

  toggleActive = async (userId: string): Promise<IInstanceManagedUser> => {
    const user = await this.userService.toggleActive(userId);
    runInAction(() => {
      set(this.users, [userId], user);
    });
    return user;
  };

  assignWorkspace = async (userId: string, workspaceSlug: string, role: number): Promise<void> => {
    await this.userService.assignWorkspace(userId, { workspace_slug: workspaceSlug, role });
  };

  removeWorkspace = async (userId: string, workspaceSlug: string): Promise<void> => {
    await this.userService.removeWorkspace(userId, workspaceSlug);
  };

  bulkImport = async (file: File): Promise<IBulkImportResult> => {
    return await this.userService.bulkImport(file);
  };
}
