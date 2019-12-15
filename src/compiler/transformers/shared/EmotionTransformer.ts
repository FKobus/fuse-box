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
 * 4. Contextual Class Names
 *   - labels in css classname `label:[filename][component][....]`
 * 5. Components as selectors
 * 6. Minification
 * 7. Dead Code Elimination
 * 8. Sourcemaps
 */
export function EmotionTransformer(opts?: EmotionTransformerOptions): ITransformer {
  const { autoInject, jsxFactory } = opts
    ? { ...defaultOptions, ...opts }
    : { ...defaultOptions };

  const imports = [];
  let needsInjection = true;
  return {
    onEachNode: (visit: IVisit) => {
      const { node, parent } = visit;

      switch (node.type) {
        case 'TaggedTemplateExpression':
          // @todo, create a functions list from the imports
          if (node.tag.name === 'css') {
            const declaratorName = (parent.type === 'VariableDeclarator') ? parent.id.name : '';

          }
          break;
      }
    },
    onTopLevelTraverse: (visit: IVisit) => {
      const node = visit.node;
      const globalContext = visit.globalContext as GlobalContext;
      if (node.type === 'ImportDeclaration') {
        // @todo, make import library dynamic
        // @todo, also make it work with 'emotion'
        if (node.source.value === '@emotion/core' && needsInjection) {
          // setting the global context so the JSXTransformer uses
          // this factory instead of the default for this file
          globalContext.jsxFactory = 'jsx';

          for (let i = 0; i < node.specifiers[0].length; i++) {
            if (node.specifiers[0].imported.name === 'jsx') {
              needsInjection = false;
            }
          }

          if (needsInjection) {
            needsInjection = false;
            // @todo, make the local configurable
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
        }
      }
    }
  }
};
