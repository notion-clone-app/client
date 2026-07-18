import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { reloadSession } from "../session/session.query";
import { usePostAuthRedirect } from "../use-post-auth-redirect.hook";
import { register } from "./registration.api";
import { RegistrationError, type RegistrationCommand } from "./registration.contracts";
import { registrationFormSchema, type RegistrationFormValues } from "./registration-form.schema";

export function useRegistrationForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const postAuthRedirect = usePostAuthRedirect();
  const [formError, setFormError] = useState("");
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: { name: "", email: "", password: "", passwordConfirmation: "" },
  });
  const mutation = useMutation({
    mutationKey: ["identity", "registration"],
    mutationFn: (command: RegistrationCommand) => register(command),
    onSuccess: async () => {
      const session = await reloadSession(queryClient);
      if (!session) throw new RegistrationError("Сессия не была создана", "unknown");
      void navigate(postAuthRedirect, { replace: true });
    },
  });

  const submit = form.handleSubmit(async (values) => {
    setFormError("");
    try {
      await mutation.mutateAsync({
        name: values.name.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
    } catch (error) {
      if (error instanceof RegistrationError && error.code === "email_taken") {
        form.setError("email", { message: error.message });
        return;
      }
      setFormError(error instanceof RegistrationError ? error.message : "Что-то пошло не так");
    }
  });

  return {
    form,
    formError,
    isSubmitting: mutation.isPending,
    submit,
  };
}
