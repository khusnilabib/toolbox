// src/tools/developer/uuid-generator/stages/validation.ts

import type { ValidationStage } from '@packages/tool-engine';
import type { ToolError } from '@packages/types';
import { inputSchema, type ToolInput } from '../manifest';
import { mapZodErrors } from '@/shared/lib/manifest-helpers';

export const validationStage: ValidationStage<ToolInput> = async (input) => {
  const result = inputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, errors: mapZodErrors(result.error) as ToolError[] };
  }
  return { success: true, data: result.data };
};
