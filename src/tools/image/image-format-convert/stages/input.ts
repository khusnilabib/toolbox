// src/tools/image/image-format-convert/stages/input.ts

import type { InputStage } from '@packages/tool-engine';
import type { ToolInput } from '../manifest';

export const inputStage: InputStage<ToolInput> = async () => {
  throw new Error('Input stage is handled by the UI form component');
};
