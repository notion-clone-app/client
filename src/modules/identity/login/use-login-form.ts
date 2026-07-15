import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { acceptSession } from "../session/session-manager";
import { usePostAuthRedirect } from "../use-post-auth-redirect.hook";
import { login } from "./login.api";
import { LoginError } from "./login.contracts";
import { loginFormSchema, type LoginFormValues } from "./login-form.schema";

export function useLoginForm() {
  const navigate = useNavigate();
  const postAuthRedirect = usePostAuthRedirect();
  const [formError, setFormError] = useState("");
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });
  const mutation = useMutation({
    mutationKey: ["identity", "login"],
    mutationFn: (command: LoginFormValues) => login(command),
    onSuccess: (session) => {
      acceptSession(session);
      void navigate(postAuthRedirect, { replace: true });
    },
  });

  const submit = form.handleSubmit(async (values) => {
    setFormError("");
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      setFormError(error instanceof LoginError ? error.message : "Что-то пошло не так");
    }
  });

  return {
    form,
    formError,
    isSubmitting: mutation.isPending,
    submit,
  };
}
