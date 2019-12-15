import { IVisit } from '../../Visitor/Visitor';
import { GlobalContext } from '../../program/GlobalContext';
import { ITransformer } from '../../program/transpileModule';

export interface EmotionTransformerOptions {
  autoInject?: boolean;
  autoLabel?: boolean;
  cssPropOptimization?: boolean;
  emotionCoreAlias?: string;
  jsxFactory?: string;
  labelFormat?: string;
  sourceMap?: boolean;
}

const defaultOptions: EmotionTransformerOptions = {
  autoInject: true,
  autoLabel: true,
  cssPropOptimization: true,
  emotionCoreAlias: '@emotion/core',
  jsxFactory: 'jsx',
  labelFormat: '[dirname]--[filename]--[local]', // [filename][dirname][local]
  sourceMap: true
};

const emotionLibraries: Array<string> = [defaultOptions.emotionCoreAlias, 'emotion'];

// Counts occurences of substr inside str
const countOccurences = (str, substr) => str.split(substr).length - 1

// From https://github.com/styled-components/babel-plugin-styled-components/blob/master/src/minify/index.js#L58
const compressSymbols = code =>
  code.split(/(\s*[;:{},]\s*)/g).reduce((str, fragment, index) => {
    // Even-indices are non-symbol fragments
    if (index % 2 === 0) {
      return str + fragment
    }

    // Only manipulate symbols outside of strings
    if (
      countOccurences(str, "'") % 2 === 0 &&
      countOccurences(str, '"') % 2 === 0
    ) {
      return str + fragment.trim()
    }

    return str + fragment
  }, '');

const minify: string = (value: string) => compressSymbols(value.replace(/[\n]\s*/g, ''));

/**
 * @todo
 * 1. get options from plugin creation
 * 2. expand the minify (way to simple :P)
 * 5. Components as selectors
 * 6. Minification
 * 7. Dead Code Elimination
 * 8. Sourcemaps
 */
export function EmotionTransformer(opts?: EmotionTransformerOptions): ITransformer {
  // @todo:
  // opts is the module and no way atm to get the plugin options reasonable
  // const { autoInject, jsxFactory } = opts
  //   ? { ...defaultOptions, ...opts }
  //   : { ...defaultOptions };

  // always use defaultOptions atm
  const {
    autoLabel,
    emotionCoreAlias,
    jsxFactory,
    labelFormat
  } = defaultOptions;

  // Process dirName and fileName only once per file
  const filePath = opts.module.props.fuseBoxPath.replace(/\.([^.]+)$/, '');
  const labelMapping = {
    '[dirname]': filePath.replace(/(\\|\/)/g, '-'),
    '[filename]': filePath.replace(/(.+)(\\|\/)(.+)$/, '$3'),
    '[local]': 'inline'
  }

  // Keep track of imported emotion functions.
  // Allows us to look for custom imports
  // import { css as emotionCss } from '@emotion/core'
  const importedEmotionFunctions = [];
  const checkForFunctions = ['css'];
  let needsInjection = true;
  return {
    onEachNode: (visit: IVisit) => {
      const { node, parent } = visit;

      switch (node.type) {
        // css({}); -> CallExpression
        case 'CallExpression':
          return;
        // css``; -> TaggedTemplateExpression
        case 'TaggedTemplateExpression':
          // Test if it's an emotioncall
          if (importedEmotionFunctions.indexOf(node.tag.name) > -1) {
            labelMapping['[local]'] = (parent.type === 'VariableDeclarator') ? parent.id.name : 'inline';
            const {
              quasi: { expressions, quasis },
              tag: callee
            } = node;

            const values = quasis.map(
              quasi => {
                const minifiedCss = minify(quasi.value.cooked);
                if (!minifiedCss) {
                  return false;
                }
                return {
                  type: 'Literal',
                  value: minifiedCss
                };
              }
            ).filter(Boolean);

            const label = !parent.callee && autoLabel
              ? {
                type: 'Literal',
                value: `label:${labelFormat.replace(/\[local\]|\[filename\]|\[dirname\]/gi, m => labelMapping[m])};`
              }
              : false;
            return {
              replaceWith: {
                arguments: [].concat(values, expressions, [label]).filter(Boolean),
                callee,
                type: "CallExpression"
              }
            }
          }
          break;
      }
    },
    onTopLevelTraverse: (visit: IVisit) => {
      const node = visit.node;
      const globalContext = visit.globalContext as GlobalContext;
      if (node.type === 'ImportDeclaration') {
        if (emotionLibraries.indexOf(node.source.value) > -1 && needsInjection) {
          for (let i = 0; i < node.specifiers.length; i++) {
            if (node.specifiers[i].imported.name === 'jsx') {
              needsInjection = false;
              // set the globalContext.jsxFactory for the JSXTransformer
              globalContext.jsxFactory = node.specifiers[i].local.name;
            } else {
              importedEmotionFunctions.push(node.specifiers[i].local.name);
            }
          }

          if (needsInjection) {
            needsInjection = false;
            // set the globalContext.jsxFactory for the JSXTransformer
            if (node.source.value === emotionCoreAlias) {
              globalContext.jsxFactory = jsxFactory;
            }
            node.specifiers.push({
              imported: {
                name: 'jsx',
                type: 'Identifier'
              },
              local: {
                name: jsxFactory,
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



/**
// Framework agnostic, do we need support for this?
import { flush, hydrate, cx, merge, getRegisteredStyles, injectGlobal, keyframes, css, sheet, cache } from 'emotion'

import { css } from '@emotion/core'


import { styled } from '@emotion/styled'
let SomeComp = styled.div({
  color: 'hotpink'
})
let AnotherComp = styled.div`
  color: ${props => props.color};
`
*/
