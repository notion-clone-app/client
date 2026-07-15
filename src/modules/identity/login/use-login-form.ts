import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { ROUTES } from "@/shared/model";
import { authSession } from "../session/auth-session";
import { login } from "./login.api";
import { loginFormSchema, type LoginFormValues } from "./login-form.schema";

export function useLoginForm() {
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });
  const mutation = useMutation({
    mutationKey: ["identity", "login"],
    mutationFn: (command: LoginFormValues) => login(command),
    onSuccess: (session) => {
      authSession.set(session);
      navigate(ROUTES.HOME, { replace: true });
    },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      console.log(error)
    }
  });

  return {
    form,
    isSubmitting: mutation.isPending,
    submit,
  };
}
