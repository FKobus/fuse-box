import { IVisit } from '../../Visitor/Visitor';
import { GlobalContext } from '../../program/GlobalContext';
import { ITransformer } from '../../program/transpileModule';

export interface EmotionTransformerOptions {
  autoInject?: boolean;
  jsxFactory?: string;
}

const defaultOptions: EmotionTransformerOptions = {
  autoInject: true,
  jsxFactory: 'jsx'
};

/**
 * @todo
 * 1. get options from plugin creation
 * 2. custom name for the jsx factory
 *   - import { jsx as jsxCustomName } from '@emotion/core'
 * 3. custom name for the library itself (if using aliases)
 *   - import { css, jsx } from 'customLibrary' -> '@emotion/core'
 * 4. labels in css classname
 * 5. the rest
 */
export function EmotionTransformer(opts?: EmotionTransformerOptions): ITransformer {
  const { autoInject, jsxFactory } = opts
    ? { ...defaultOptions, ...opts }
    : { ...defaultOptions };

  const imports = [];
  let needsInjection = true;
  return {
    onEachNode: (visit: IVisit) => { },
    onTopLevelTraverse: (visit: IVisit) => {
      const node = visit.node;
      const global = visit.globalContext as GlobalContext;
      if (node.type === 'ImportDeclaration') {
        if (node.source.value === '@emotion/core' && needsInjection) {
          // setting the global context so the JSXTransformer uses
          // this factory instead of the default for this file
          global.jsxFactory = 'jsx';
          for (let i = 0; i < node.specifiers[0].length; i++) {
            if (node.specifiers[0].imported.name === 'jsx') {
              needsInjection = false;
            }
          }

          if (needsInjection) {
            needsInjection = false;
            node.specifiers.push({
              imported: {
                name: 'jsx',
                type: 'Identifier'
              },
              local: {
                name: 'jsx',
                type: 'Identifier'
              },
              type: 'ImportSpecifier'
            });
          }
        } else if (node.source.value === '@emotion/styled' && !global.jsxFactory) {
          // global.jsxFactory = 'jsx';
        }
      }
    }
  }
};
