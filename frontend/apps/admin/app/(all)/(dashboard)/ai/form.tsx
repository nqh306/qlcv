/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useForm } from "react-hook-form";
import { Lightbulb } from "lucide-react";
import { useTranslation } from "@qlcv/i18n";
import { Button } from "@qlcv/propel/button";
import { TOAST_TYPE, setToast } from "@qlcv/propel/toast";
import type { IFormattedInstanceConfiguration, TInstanceAIConfigurationKeys } from "@qlcv/types";
// components
import type { TControllerInputFormField } from "@/components/common/controller-input";
import { ControllerInput } from "@/components/common/controller-input";
// hooks
import { useInstance } from "@/hooks/store";

type IInstanceAIForm = {
  config: IFormattedInstanceConfiguration;
};

type AIFormValues = Record<TInstanceAIConfigurationKeys, string>;

export function InstanceAIForm(props: IInstanceAIForm) {
  const { config } = props;
  // store
  const { updateInstanceConfigurations } = useInstance();
  const { t } = useTranslation();
  // form data
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AIFormValues>({
    defaultValues: {
      LLM_API_KEY: config["LLM_API_KEY"],
      LLM_MODEL: config["LLM_MODEL"],
    },
  });

  const aiFormFields: TControllerInputFormField[] = [
    {
      key: "LLM_MODEL",
      type: "text",
      label: t("admin.page.ai.llm_model"),
      description: (
        <>
          {t("admin.page.ai.llm_model_help")}{" "}
          <a
            href="https://platform.openai.com/docs/models/overview"
            target="_blank"
            className="text-accent-primary hover:underline"
            rel="noreferrer"
          >
            {t("admin.page.ai.learn_more")}
          </a>
        </>
      ),
      placeholder: "gpt-4o-mini",
      error: Boolean(errors.LLM_MODEL),
      required: false,
    },
    {
      key: "LLM_API_KEY",
      type: "password",
      label: t("admin.page.ai.api_key"),
      description: (
        <>
          {t("admin.page.ai.api_key_help")}{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            className="text-accent-primary hover:underline"
            rel="noreferrer"
          >
            {t("admin.page.ai.api_key_link_text")}
          </a>
        </>
      ),
      placeholder: "sk-asddassdfasdefqsdfasd23das3dasdcasd",
      error: Boolean(errors.LLM_API_KEY),
      required: false,
    },
  ];

  const onSubmit = async (formData: AIFormValues) => {
    const payload: Partial<AIFormValues> = { ...formData };

    await updateInstanceConfigurations(payload)
      .then(() =>
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("admin.common.success"),
          message: t("admin.page.users.toast.updated_success"),
        })
      )
      .catch((err) => console.error(err));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div>
          <div className="pb-1 text-18 font-medium text-primary">{t("admin.page.ai.openai")}</div>
          <div className="text-13 font-regular text-tertiary">{t("admin.page.ai.openai_desc")}</div>
        </div>
        <div className="grid-col grid w-full grid-cols-1 items-center justify-between gap-x-12 gap-y-8 lg:grid-cols-3">
          {aiFormFields.map((field) => (
            <ControllerInput
              key={field.key}
              control={control}
              type={field.type}
              name={field.key}
              label={field.label}
              description={field.description}
              placeholder={field.placeholder}
              error={field.error}
              required={field.required}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start gap-4">
        <Button variant="primary" size="lg" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
          {isSubmitting ? t("admin.common.saving") : t("admin.common.save_changes")}
        </Button>

        <div className="relative inline-flex items-center gap-1.5 rounded-sm border border-accent-subtle bg-accent-subtle px-4 py-2 text-caption-sm-regular text-accent-secondary">
          <Lightbulb className="size-4" />
          <div>
            {t("admin.page.ai.preferred_vendor")}{" "}
            <a className="font-medium underline" href="https://ems.evngenco1.vn/qlcv/contact">
              {t("admin.page.ai.contact_us")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
