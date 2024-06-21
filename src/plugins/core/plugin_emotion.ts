import { EmotionTransformer } from '../../compiler/transformers/shared/EmotionTransformer';
import { Context } from '../../core/Context';

export interface PluginEmotionOptions {
  autoInject?: boolean;
  target?: string | RegExp;
  autoLabel?: boolean;
  cssPropOptimization?: boolean;
  emotionCoreAlias?: string;
  jsxFactory?: string;
  labelFormat?: string;
  sourceMap?: boolean;
}

export function pluginEmotion(opts?: PluginEmotionOptions) {
  const { target = /\.(js|jsx|ts|tsx)$/, ...options } = opts;
  // somehow pass options to the Transformer
  return (ctx: Context) => {
    ctx.transformerAtPath(target, EmotionTransformer, options);
  };
};
