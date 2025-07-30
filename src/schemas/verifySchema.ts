import {z} from 'zod';

export const verifySchema = z.object({
  verifyCode: z.string().length(6, "Verifiaction code must have 6 dfgits"),
});