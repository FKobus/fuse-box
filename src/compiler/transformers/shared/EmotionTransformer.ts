import { IVisit } from '../../Visitor/Visitor';
import { ASTNode } from '../../interfaces/AST';
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
  // labelFormat: '[dirname]--[filename]--[local]', // [filename][dirname][local]
  labelFormat: '[dirname]--[local]', // [filename][dirname][local]
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
 * 3. How do we know we're in production or development mode?
 * 4. Components as selectors
 * 5. Minification
 * 6. Dead Code Elimination
 * 7. Sourcemaps
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
  };

  const renderAutoLabel: ASTNode = () => {
    return {
      type: 'Literal',
      value: `label:${labelFormat.replace(
        /\[local\]|\[filename\]|\[dirname\]/gi,
        m => labelMapping[m]
      ).replace(
        /\-\-$/,
        ''
      )};`
    };
  };

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
          // Test if it's an emotioncall
          if (importedEmotionFunctions.indexOf(node.callee.name) > -1) {

            labelMapping['[local]'] = (parent.type === 'VariableDeclarator')
              ? parent.id.name
              : '';

            const label = (
              !parent.callee || (
                parent.callee &&
                parent.callee.name !== node.callee.name
              )) &&
              autoLabel &&
              renderAutoLabel();
            if (label) {
              node.arguments.push(label);
            }
          }
          break;

        // css``; -> TaggedTemplateExpression
        case 'TaggedTemplateExpression':
          // Test if it's an emotioncall
          if (importedEmotionFunctions.indexOf(node.tag.name) > -1) {
            const {
              quasi: { expressions, quasis },
              tag: callee
            } = node;

            const values = [];
            for (let i = 0; i < quasis.length; i++) {
              if (quasis[i].value.cooked) {
                // We don't need minification in devMode!
                if (true) {
                  values.push({
                    type: 'Literal',
                    value: quasis[i].value.cooked
                  });
                  continue;
                }

                const minifiedCss = minify(quasis[i].value.cooked);
                if (minifiedCss) {
                  values.push({
                    type: 'Literal',
                    value: minifiedCss
                  });
                }
              }
            }

            // Replace this node with new shiny stuff
            return {
              replaceWith: {
                arguments: [].concat(values, expressions).filter(Boolean),
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
          const specifiersLength = node.specifiers.length;
          let i = 0;
          while (i < specifiersLength) {
            if (node.specifiers[i].imported.name === 'jsx') {
              needsInjection = false;
              // set the globalContext.jsxFactory for the JSXTransformer
              globalContext.jsxFactory = node.specifiers[i].local.name;
            } else {
              importedEmotionFunctions.push(node.specifiers[i].local.name);
            }
            i++;
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
