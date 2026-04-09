export interface IUserWorkspaceMembership {
  workspace_id: string;
  workspace_name: string;
  workspace_slug: string;
  role: number;
  is_active: boolean;
}

export interface IInstanceManagedUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  is_active: boolean;
  is_email_verified: boolean;
  date_joined: string;
  last_active: string | null;
  last_login_time: string | null;
  avatar_url: string | null;
  is_password_autoset: boolean;
  is_password_reset_required: boolean;
  workspace_count?: number;
  workspace_memberships?: IUserWorkspaceMembership[];
  mobile_number?: string;
  user_timezone?: string;
  admin_role: number | null;
  admin_scoped_workspaces: string[];
  project_memberships?: IUserProjectMembership[];
}

export interface IUserProjectMembership {
  project_id: string;
  project_name: string;
  project_identifier: string;
  workspace_slug: string;
  role: number;
  is_active: boolean;
}

export interface IWorkspaceProject {
  id: string;
  name: string;
  identifier: string;
  is_member: boolean;
}

export interface IInstanceAdminMe {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar: string;
  avatar_url: string;
  is_active: boolean;
  is_email_verified: boolean;
  user_timezone: string;
  username: string;
  is_password_autoset: boolean;
  instance_role: number | null;
  scoped_workspace_ids: string[];
}

export interface ICreateUserPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  workspace_slugs: string[];
  role: number;
}

export interface ICreateUserResponse {
  user: IInstanceManagedUser;
  temp_password: string;
}

export interface IResetPasswordResponse {
  temp_password: string;
}

export interface IBulkImportError {
  row: number;
  email: string;
  error: string;
}

export interface IBulkImportResult {
  created: number;
  errors: IBulkImportError[];
}
