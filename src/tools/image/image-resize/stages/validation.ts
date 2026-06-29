// src/tools/image/image-resize/stages/validation.ts

import type { ValidationStage } from '@packages/tool-engine';
import type { ToolError } from '@packages/types';
import { inputSchema, type ToolInput } from '../manifest';
import { mapZodErrors } from '@/shared/lib/manifest-helpers';

export const validationStage: ValidationStage<ToolInput> = async (input) => {
  const result = inputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, errors: mapZodErrors(result.error) as ToolError[] };
  }
  const data = result.data;
  // At least one of width, height, or scale must be provided.
  if (data.width === undefined && data.height === undefined && data.scale === undefined) {
    return {
      success: false,
      errors: [
        {
          kind: 'validation',
          cause: 'missing_dimension',
          field: 'width',
          userMessage: {
            what: 'A target width, height, or scale is required.',
            howToFix: 'Provide at least one of width, height, or scale.',
          },
        },
      ],
    };
  }
  return { success: true, data };
};
