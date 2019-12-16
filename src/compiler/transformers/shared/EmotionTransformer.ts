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
  module: any;
}

const labelMapping = {
  '[dirname]': '',
  '[filename]': '',
  '[local]': ''
};

// From https://github.com/styled-components/babel-plugin-styled-components/blob/master/src/minify/index.js#L58
// Counts occurences of substr inside str
const countOccurences = (str, substr) => str.split(substr).length - 1
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

// Super simple minifier.. doesn't cover any edge cases or side effects
const minify = (value: string): string => compressSymbols(value.replace(/[\n]\s*/g, ''));

/**
 * @todo
 * 1. expand the minify (way to simple :P)
 * 2. How do we know we're in production or development mode?
 *
 * 3. Components as selectors
 * 4. Minification
 * 5. Sourcemaps
 *
 * 6. Dead Code Elimination // not needed someone told mee
 */
export function EmotionTransformer(opts?: EmotionTransformerOptions): ITransformer {
  const {
    autoLabel = true,
    emotionCoreAlias = '@emotion/core',
    jsxFactory = 'jsx',
    labelFormat = '[dirname]--[local]',
    // autoInject = true,
    // cssPropOptimization = true,
    // sourceMap = true
  } = opts;

  const emotionLibraries = [[emotionCoreAlias, 'emotion'], ['@emotion/styled']];

  // Process dirName and fileName only once per file
  const filePath = opts.module.props.fuseBoxPath.replace(/\.([^.]+)$/, '');
  labelMapping['[dirname]'] = filePath.replace(/(\\|\/)/g, '-');
  labelMapping['[filename]'] = filePath.replace(/(.+)(\\|\/)(.+)$/, '$3');

  const renderAutoLabel = (): ASTNode => {
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
  let needsInjection = true;
  const isEmotionCall = (node: ASTNode, index: string): boolean =>
    // css('styles')
    importedEmotionFunctions.indexOf(node[index].name) > -1 ||
    // styled('obj')('styles')
    importedEmotionFunctions.indexOf((node[index].callee && node[index].callee.name)) > -1 ||
    // styled.div('div')
    importedEmotionFunctions.indexOf((node[index].object && node[index].object.name)) > -1;

  return {
    onEachNode: (visit: IVisit) => {
      const { node, parent } = visit;

      switch (node.type) {
        case 'CallExpression':
          // append the css class label
          if (!parent.callee && autoLabel && isEmotionCall(node, 'callee')) {
            labelMapping['[local]'] =
              (parent.type === 'VariableDeclarator' && parent.id.name) ||
              (parent.type === 'AssignmentExpression' && parent.left.property.name) ||
              '';
            node.arguments.push(renderAutoLabel());
          }
          break;

        case 'TaggedTemplateExpression':
          if (isEmotionCall(node, 'tag')) {
            let {
              quasi: { expressions, quasis },
              tag: callee
            } = node;

            // Convert template strings to a literal and put the expressions back at it's position
            const styleProperties = [];
            const quasisLength = quasis.length
            let i = 0;
            while (i < quasisLength) {
              if (quasis[i].value.cooked) {
                // We don't need minification in devMode!
                styleProperties.push({
                  type: 'Literal',
                  value: true ? quasis[i].value.cooked : minify(quasis[i].value.cooked)
                });
              }
              // Put the expressions back in the place where they belong
              if (!quasis[i].tail && expressions.length > 0) {
                styleProperties.push(expressions.shift());
              }
              i++;
            }

            // Replace this node with new shiny stuff
            return {
              replaceWith: {
                arguments: styleProperties.filter(Boolean),
                callee,
                type: "CallExpression"
              }
            };
          }
          break;
      }
    },
    onTopLevelTraverse: (visit: IVisit) => {
      const node = visit.node;
      const globalContext = visit.globalContext as GlobalContext;
      if (node.type === 'ImportDeclaration') {
        if ([].concat(emotionLibraries[0], emotionLibraries[1]).indexOf(node.source.value) > -1) {
          const specifiersLength = node.specifiers.length;
          let i = 0;
          while (i < specifiersLength) {
            if (node.specifiers[i].imported && node.specifiers[i].imported.name === 'jsx') {
              needsInjection = false;
              // set the globalContext.jsxFactory for the JSXTransformer
              globalContext.jsxFactory = node.specifiers[i].local.name;
            } else {
              importedEmotionFunctions.push(node.specifiers[i].local.name);
            }
            i++;
          }

          if (needsInjection && emotionLibraries[0].indexOf(node.source.value) > -1) {
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
