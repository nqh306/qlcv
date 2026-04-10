/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { action, computed, observable, runInAction, makeObservable } from "mobx";
// qlcv internal packages
import type { TUserStatus } from "@qlcv/constants";
import { EUserStatus } from "@qlcv/constants";
import { AuthService, UserService } from "@qlcv/services";
import type { IUser } from "@qlcv/types";
// root store
import type { RootStore } from "@/store/root.store";

export interface IUserStore {
  // observables
  isLoading: boolean;
  userStatus: TUserStatus | undefined;
  isUserLoggedIn: boolean | undefined;
  currentUser: IUser | undefined;
  instanceRole: number | undefined;
  scopedWorkspaceIds: string[];
  // computed
  isSuperAdmin: boolean;
  isWorkspaceAdmin: boolean;
  // fetch actions
  hydrate: (data: any) => void;
  fetchCurrentUser: () => Promise<IUser>;
  reset: () => void;
  signOut: () => void;
}

export class UserStore implements IUserStore {
  // observables
  isLoading: boolean = true;
  userStatus: TUserStatus | undefined = undefined;
  isUserLoggedIn: boolean | undefined = undefined;
  currentUser: IUser | undefined = undefined;
  instanceRole: number | undefined = undefined;
  scopedWorkspaceIds: string[] = [];
  // services
  userService;
  authService;

  constructor(private store: RootStore) {
    makeObservable(this, {
      // observables
      isLoading: observable.ref,
      userStatus: observable,
      isUserLoggedIn: observable.ref,
      currentUser: observable,
      instanceRole: observable.ref,
      scopedWorkspaceIds: observable,
      // computed
      isSuperAdmin: computed,
      isWorkspaceAdmin: computed,
      // action
      fetchCurrentUser: action,
      reset: action,
      signOut: action,
    });
    this.userService = new UserService();
    this.authService = new AuthService();
  }

  get isSuperAdmin(): boolean {
    return (this.instanceRole ?? 0) >= 30;
  }

  get isWorkspaceAdmin(): boolean {
    return this.instanceRole === 20;
  }

  hydrate = (data: any) => {
    if (data) this.currentUser = data;
  };

  /**
   * @description Fetches the current user
   * @returns Promise<IUser>
   */
  fetchCurrentUser = async () => {
    try {
      if (this.currentUser === undefined) this.isLoading = true;
      const currentUser = await this.userService.adminDetails();
      if (currentUser) {
        await this.store.instance.fetchInstanceAdmins();
        // Backend returns instance_role and scoped_workspace_ids beyond IUser type
        const adminData = currentUser as IUser & { instance_role?: number; scoped_workspace_ids?: string[] };
        runInAction(() => {
          this.isUserLoggedIn = true;
          this.currentUser = currentUser;
          this.instanceRole = adminData.instance_role ?? undefined;
          this.scopedWorkspaceIds = adminData.scoped_workspace_ids ?? [];
          this.isLoading = false;
        });
      } else {
        runInAction(() => {
          this.isUserLoggedIn = false;
          this.currentUser = undefined;
          this.isLoading = false;
        });
      }
      return currentUser;
    } catch (error: any) {
      this.isLoading = false;
      this.isUserLoggedIn = false;
      if (error.status === 403)
        this.userStatus = {
          status: EUserStatus.AUTHENTICATION_NOT_DONE,
          message: error?.message || "",
        };
      else
        this.userStatus = {
          status: EUserStatus.ERROR,
          message: error?.message || "",
        };
      throw error;
    }
  };

  reset = async () => {
    this.isUserLoggedIn = false;
    this.currentUser = undefined;
    this.isLoading = false;
    this.userStatus = undefined;
    this.instanceRole = undefined;
    this.scopedWorkspaceIds = [];
  };

  signOut = async () => {
    this.store.resetOnSignOut();
  };
}
