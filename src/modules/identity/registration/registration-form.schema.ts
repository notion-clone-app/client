import { z } from "zod";

export const registrationFormSchema = z
  .object({
    name: z.string().trim().min(2, "Введите минимум 2 символа"),
    lastName: z.string().trim().min(2, "Введите минимум 2 символа"),
    email: z.email("Введите корректный email"),
    password: z
      .string()
      .min(8, "Пароль должен содержать минимум 8 символов")
      .regex(/[A-Za-zА-Яа-я]/, "Добавьте хотя бы одну букву")
      .regex(/\d/, "Добавьте хотя бы одну цифру"),
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: "Пароли не совпадают",
    path: ["passwordConfirmation"],
  });

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;
