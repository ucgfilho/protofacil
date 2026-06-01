import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Informe um nome para o projeto.'),
  description: z.string().trim().max(500, 'Use até 500 caracteres.').optional().nullable()
});

export const renameProjectSchema = z.object({
  name: z.string().trim().min(2, 'Informe um nome para o projeto.')
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type RenameProjectInput = z.infer<typeof renameProjectSchema>;
