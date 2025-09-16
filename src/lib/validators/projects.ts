import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'name is required').max(255),
  description: z.string().max(1000).optional(),
});

export const updateProjectSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
  })
  .refine((data) => !!(data.name || data.description), {
    message: 'At least one of name or description is required',
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
