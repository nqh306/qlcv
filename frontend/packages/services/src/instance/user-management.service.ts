import { API_BASE_URL } from "@qlcv/constants";
import type {
  IInstanceManagedUser,
  ICreateUserPayload,
  ICreateUserResponse,
  IResetPasswordResponse,
  IBulkImportResult,
  IWorkspaceProject,
  TPaginationInfo,
} from "@qlcv/types";
import { APIService } from "../api.service";

export class InstanceUserService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async listUsers(params?: {
    workspace?: string;
    search?: string;
    cursor?: string;
    per_page?: number;
  }): Promise<{ results: IInstanceManagedUser[] } & TPaginationInfo> {
    return this.get("/api/instances/users/", { params }).then((response) => response?.data);
  }

  async getUserDetail(userId: string): Promise<IInstanceManagedUser> {
    return this.get(`/api/instances/users/${userId}/`).then((response) => response?.data);
  }

  async createUser(data: ICreateUserPayload): Promise<ICreateUserResponse> {
    return this.post("/api/instances/users/", data).then((response) => response?.data);
  }

  async updateUser(userId: string, data: Partial<IInstanceManagedUser>): Promise<IInstanceManagedUser> {
    return this.patch(`/api/instances/users/${userId}/`, data).then((response) => response?.data);
  }

  async resetPassword(userId: string): Promise<IResetPasswordResponse> {
    return this.post(`/api/instances/users/${userId}/reset-password/`).then((response) => response?.data);
  }

  async toggleActive(userId: string): Promise<IInstanceManagedUser> {
    return this.post(`/api/instances/users/${userId}/toggle-active/`).then((response) => response?.data);
  }

  async assignWorkspace(userId: string, data: { workspace_slug: string; role: number }): Promise<void> {
    return this.post(`/api/instances/users/${userId}/assign-workspace/`, data).then((response) => response?.data);
  }

  async removeWorkspace(userId: string, workspaceSlug: string): Promise<void> {
    return this.delete(`/api/instances/users/${userId}/remove-workspace/${workspaceSlug}/`).then(
      (response) => response?.data
    );
  }

  async bulkImport(file: File): Promise<IBulkImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    return this.post("/api/instances/users/bulk-import/", formData).then((response) => response?.data);
  }

  async listUserProjects(userId: string, workspaceSlug: string): Promise<IWorkspaceProject[]> {
    return this.get(`/api/instances/users/${userId}/projects/`, { params: { workspace: workspaceSlug } }).then(
      (response) => response?.data
    );
  }

  async assignProject(userId: string, data: { project_id: string; role: number }): Promise<void> {
    return this.post(`/api/instances/users/${userId}/assign-project/`, data).then((response) => response?.data);
  }

  async removeProject(userId: string, projectId: string): Promise<void> {
    return this.delete(`/api/instances/users/${userId}/projects/${projectId}/`).then((response) => response?.data);
  }

  async setAdminRole(userId: string, data: { role: number | null }): Promise<any> {
    return this.post(`/api/instances/users/${userId}/set-admin-role/`, data).then((response) => response?.data);
  }

  async checkAvailability(params: { username?: string; email?: string }): Promise<{ available: boolean; error?: string }> {
    return this.get("/api/instances/users/check-availability/", { params }).then((response) => response?.data);
  }
}
