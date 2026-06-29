import type { ValidationStage } from '@packages/tool-engine';
import { inputSchema } from '../manifest';
import type { ToolInput } from '../manifest';

export const validationStage: ValidationStage<ToolInput> = async (input: unknown) => {
  const result = inputSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      kind: 'validation' as const,
      cause: String(issue.path.join('.') || 'unknown'),
      field: String(issue.path.join('.') || 'unknown'),
      message: issue.message,
      userMessage: {
        what: 'Validation failed.',
        howToFix: issue.message,
      },
    })),
  };
};
