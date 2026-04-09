/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useSearchParams } from "next/navigation";
// helpers
import type { TAuthErrorInfo } from "@/helpers/authentication.helper";
import { EErrorAlertType, authErrorHandler, EAuthenticationErrorCodes } from "@/helpers/authentication.helper";
// types
import { EAuthModes, EAuthSteps } from "@/types/auth";
// local imports
import { TermsAndConditions } from "../terms-and-conditions";
import { AuthBanner } from "./auth-banner";
import { AuthHeader } from "./auth-header";
import { AuthEmailForm } from "./email";
import { AuthPasswordForm } from "./password";

export const AuthRoot = observer(function AuthRoot() {
  // router params
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || undefined;
  const error_code = searchParams.get("error_code") || undefined;
  const nextPath = searchParams.get("next_path") || undefined;
  // states
  const [authStep, setAuthStep] = useState<EAuthSteps>(EAuthSteps.EMAIL);
  const [email, setEmail] = useState(emailParam ? emailParam.toString() : "");
  const [errorInfo, setErrorInfo] = useState<TAuthErrorInfo | undefined>(undefined);

  useEffect(() => {
    if (error_code) {
      const errorhandler = authErrorHandler(error_code?.toString() as EAuthenticationErrorCodes);
      if (errorhandler) {
        if (
          errorhandler.code === EAuthenticationErrorCodes.AUTHENTICATION_FAILED_SIGN_IN ||
          errorhandler.code === EAuthenticationErrorCodes.AUTHENTICATION_FAILED_SIGN_UP
        ) {
          setAuthStep(EAuthSteps.PASSWORD);
        }
        setErrorInfo(errorhandler);
      }
    }
  }, [error_code]);

  // Signup is disabled — always go straight to sign-in password form
  const handleEmailSubmit = async (data: { email: string }) => {
    setEmail(data.email);
    setErrorInfo(undefined);
    setAuthStep(EAuthSteps.PASSWORD);
  };

  return (
    <div className="mt-10 flex w-full flex-grow flex-col items-center justify-center py-6">
      <div className="relative flex w-full max-w-[22.5rem] flex-col gap-6">
        {errorInfo && errorInfo?.type === EErrorAlertType.BANNER_ALERT && (
          <AuthBanner bannerData={errorInfo} handleBannerData={(value) => setErrorInfo(value)} />
        )}
        <AuthHeader authMode={EAuthModes.SIGN_IN} />

        {authStep === EAuthSteps.EMAIL && <AuthEmailForm defaultEmail={email} onSubmit={handleEmailSubmit} />}
        {authStep === EAuthSteps.PASSWORD && (
          <AuthPasswordForm
            mode={EAuthModes.SIGN_IN}
            isPasswordAutoset={false}
            isSMTPConfigured={false}
            email={email}
            nextPath={nextPath}
            handleEmailClear={() => {
              setEmail("");
              setAuthStep(EAuthSteps.EMAIL);
            }}
            handleAuthStep={(step: EAuthSteps) => {
              setAuthStep(step);
            }}
          />
        )}
        <TermsAndConditions isSignUp={false} />
      </div>
    </div>
  );
});
