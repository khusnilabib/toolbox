// src/tools/pdf/pdf-compress/stages/validation.ts

import type { ValidationStage } from '@packages/tool-engine';
import type { ToolError } from '@packages/types';
import { inputSchema, MAX_PDF_SIZE, type ToolInput } from '../manifest';
import { mapZodErrors } from '@/shared/lib/manifest-helpers';

export const validationStage: ValidationStage<ToolInput> = async (input) => {
  const result = inputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, errors: mapZodErrors(result.error) as ToolError[] };
  }
  const data = result.data;
  if (data.file.size > MAX_PDF_SIZE) {
    return {
      success: false,
      errors: [
        {
          kind: 'validation',
          cause: 'max_size',
          field: 'file',
          userMessage: {
            what: 'PDF exceeds the 50 MB limit.',
            howToFix: 'Use a smaller PDF.',
          },
        },
      ],
    };
  }
  return { success: true, data };
};
