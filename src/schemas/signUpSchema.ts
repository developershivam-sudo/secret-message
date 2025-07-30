import { z } from 'zod';

export const usernameValidation = z
  .string()
  .min(2, "Username must have atleast 2 characters")
  .max(20, "Username must be no more than 2 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Usename must not contain special characters");

export const signUpSchema = z.object({ //z.object is used due to multiple values
  username: usernameValidation,
  email: z.email({message: "Invalid email address"}),
  password: z.string().min(6, {message: "Password must have atleast 6 characters"}),
});
