import { EmotionTransformer } from '../../compiler/transformers/shared/EmotionTransformer';
import { Context } from '../../core/Context';
import { ITransformer } from '../../compiler/program/transpileModule';

export interface PluginEmotionOptions {
  autoInject?: boolean
  target?: string | RegExp
}

const defaultOptions: PluginEmotionOptions = {
  target: /\.(js|jsx|ts|tsx)$/,
  autoInject: true
};

export function pluginEmotion(opts?: PluginEmotionOptions) {
  const { target, ...options } = opts
    ? { ...defaultOptions, ...opts }
    : { ...defaultOptions };
  // somehow pass options to the Transformer
  return (ctx: Context) => {
    ctx.transformerAtPath(target, EmotionTransformer);
  };
};
