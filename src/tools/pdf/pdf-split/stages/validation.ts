// src/tools/pdf/pdf-split/stages/validation.ts

import type { ValidationStage } from '@packages/tool-engine';
import type { ToolError } from '@packages/types';
import { inputSchema, MAX_PDF_SIZE, type ToolInput } from '../manifest';
import { mapZodErrors } from '@/shared/lib/manifest-helpers';
import { parsePageRange } from '../../_shared/lib/pdf-utils';

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
  try {
    parsePageRange(data.pageRange);
  } catch {
    return {
      success: false,
      errors: [
        {
          kind: 'validation',
          cause: 'invalid_page_range',
          field: 'pageRange',
          userMessage: {
            what: 'Invalid page range.',
            howToFix: 'Use a format like "1-3, 5, 8-10" (1-based, inclusive).',
          },
        },
      ],
    };
  }
  return { success: true, data };
};
