/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { KeyRound, Mails } from "lucide-react";
// types
import type {
  TCoreInstanceAuthenticationModeKeys,
  TGetBaseAuthenticationModeProps,
  TInstanceAuthenticationModes,
} from "@qlcv/types";
// assets
import giteaLogo from "@/app/assets/logos/gitea-logo.svg?url";
import githubLightModeImage from "@/app/assets/logos/github-black.png?url";
import githubDarkModeImage from "@/app/assets/logos/github-white.png?url";
import gitlabLogo from "@/app/assets/logos/gitlab-logo.svg?url";
import googleLogo from "@/app/assets/logos/google-logo.svg?url";
// components
import { EmailCodesConfiguration } from "@/components/authentication/email-config-switch";
import { GiteaConfiguration } from "@/components/authentication/gitea-config";
import { GithubConfiguration } from "@/components/authentication/github-config";
import { GitlabConfiguration } from "@/components/authentication/gitlab-config";
import { GoogleConfiguration } from "@/components/authentication/google-config";
import { PasswordLoginConfiguration } from "@/components/authentication/password-config-switch";

type TFn = (key: string) => string;

// Authentication methods
export const getCoreAuthenticationModesMap = (
  { disabled, updateConfig, resolvedTheme }: TGetBaseAuthenticationModeProps,
  t: TFn
): Record<TCoreInstanceAuthenticationModeKeys, TInstanceAuthenticationModes> => ({
  "unique-codes": {
    key: "unique-codes",
    name: t("admin.page.authentication.unique_codes"),
    description: t("admin.page.authentication.unique_codes_desc"),
    icon: <Mails className="h-6 w-6 p-0.5 text-tertiary" />,
    config: <EmailCodesConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "ENABLE_MAGIC_LINK_LOGIN",
  },
  "passwords-login": {
    key: "passwords-login",
    name: t("admin.page.authentication.passwords"),
    description: t("admin.page.authentication.passwords_desc"),
    icon: <KeyRound className="h-6 w-6 p-0.5 text-tertiary" />,
    config: <PasswordLoginConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "ENABLE_EMAIL_PASSWORD",
  },
  google: {
    key: "google",
    name: t("admin.page.authentication.google"),
    description: t("admin.page.authentication.google_desc"),
    icon: <img src={googleLogo} height={20} width={20} alt="Google Logo" />,
    config: <GoogleConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "IS_GOOGLE_ENABLED",
  },
  github: {
    key: "github",
    name: t("admin.page.authentication.github"),
    description: t("admin.page.authentication.github_desc"),
    icon: (
      <img
        src={resolvedTheme === "dark" ? githubDarkModeImage : githubLightModeImage}
        height={20}
        width={20}
        alt="GitHub Logo"
      />
    ),
    config: <GithubConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "IS_GITHUB_ENABLED",
  },
  gitlab: {
    key: "gitlab",
    name: t("admin.page.authentication.gitlab"),
    description: t("admin.page.authentication.gitlab_desc"),
    icon: <img src={gitlabLogo} height={20} width={20} alt="GitLab Logo" />,
    config: <GitlabConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "IS_GITLAB_ENABLED",
  },
  gitea: {
    key: "gitea",
    name: t("admin.page.authentication.gitea"),
    description: t("admin.page.authentication.gitea_desc"),
    icon: <img src={giteaLogo} height={20} width={20} alt="Gitea Logo" />,
    config: <GiteaConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "IS_GITEA_ENABLED",
  },
});
