/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { observer } from "mobx-react";
import { useSearchParams } from "next/navigation";
import { EAuthModes, EAuthSteps } from "@plane/constants";
// helpers
import type { TAuthErrorInfo } from "@/helpers/authentication.helper";
// hooks
import { useAppRouter } from "@/hooks/use-app-router";
// local components
import { AuthEmailForm } from "./email";
import { AuthPasswordForm } from "./password";

type TAuthFormRoot = {
  authStep: EAuthSteps;
  authMode: EAuthModes;
  email: string;
  setEmail: (email: string) => void;
  setAuthMode: (authMode: EAuthModes) => void;
  setAuthStep: (authStep: EAuthSteps) => void;
  setErrorInfo: (errorInfo: TAuthErrorInfo | undefined) => void;
  currentAuthMode: EAuthModes;
};

export const AuthFormRoot = observer(function AuthFormRoot(props: TAuthFormRoot) {
  const { authStep, email, setEmail, setAuthMode, setAuthStep, setErrorInfo, currentAuthMode } = props;
  // router
  const router = useAppRouter();
  // query params
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next_path");

  // Signup is disabled — always go straight to sign-in password form
  const handleEmailSubmit = async (data: { email: string }) => {
    setEmail(data.email);
    setErrorInfo(undefined);
    setAuthMode(EAuthModes.SIGN_IN);
    setAuthStep(EAuthSteps.PASSWORD);
  };

  const handleEmailClear = () => {
    setAuthMode(currentAuthMode);
    setErrorInfo(undefined);
    setEmail("");
    setAuthStep(EAuthSteps.EMAIL);
    router.push("/");
  };

  if (authStep === EAuthSteps.EMAIL) {
    return <AuthEmailForm defaultEmail={email} onSubmit={handleEmailSubmit} />;
  }
  if (authStep === EAuthSteps.PASSWORD) {
    return (
      <AuthPasswordForm
        mode={EAuthModes.SIGN_IN}
        isSMTPConfigured={false}
        email={email}
        handleEmailClear={handleEmailClear}
        handleAuthStep={(step: EAuthSteps) => {
          setAuthStep(step);
        }}
        nextPath={nextPath || undefined}
      />
    );
  }

  return <></>;
});
