import { IVisit } from '../../Visitor/Visitor';
import { ASTNode } from '../../interfaces/AST';
import { ITransformer } from '../../program/transpileModule';

//const Factories: { [key: string]: () => ASTNode } = {};

function createJSXFactory(props: { first: string; second?: string }): (args: Array<ASTNode>) => ASTNode {
  if (!props.second) {
    return (args: Array<ASTNode>): ASTNode => {
      return {
        arguments: args,
        callee: {
          name: props.first,
          type: 'Identifier',
        },
        type: 'CallExpression',
      };
    };
  }
  return (args: Array<ASTNode>): ASTNode => {
    return {
      arguments: args,
      callee: {
        computed: false,
        object: {
          name: props.first,
          type: 'Identifier',
        },
        property: {
          name: props.second,
          type: 'Identifier',
        },
        type: 'MemberExpression',
      },
      type: 'CallExpression',
    };
  };
}

function createObjectAssignExpression(): ASTNode {
  return {
    arguments: [],
    callee: {
      computed: false,
      object: {
        name: 'Object',
        type: 'Identifier',
      },
      property: {
        name: 'assign',
        type: 'Identifier',
      },
      type: 'MemberExpression',
    },
    type: 'CallExpression',
  };
}

export interface IJSXTranformerOptions {
  jsxFactory?: string;
}
export function JSXTransformer(opts?: IJSXTranformerOptions): ITransformer {
  if (!opts) opts = {};
  if (!opts.jsxFactory) opts.jsxFactory = 'React.createElement';

  const [first, second] = opts.jsxFactory.split('.');
  const JSXFragment: ASTNode = {
    computed: false,
    object: {
      name: first,
      type: 'Identifier',
    },
    property: {
      name: 'Fragment',
      type: 'Identifier',
    },
    type: 'MemberExpression',
  };
  let createElement = createJSXFactory({ first, second });
  let customJsxFactory = false;
  return {
    onEachNode: (visit: IVisit) => {
      const node = visit.node;
      const name = node.name as string;
      // locals not used?
      const locals = visit.scope && visit.scope.locals ? visit.scope.locals : {};
      switch (node.type) {
        case 'JSXElement':
          let props: ASTNode;
          let propObjects: Array<ASTNode> = [];
          let propObject: ASTNode;
          let newObj = true;

          let spreaded = false;
          const { openingElement } = node;

          for (const attr of openingElement.attributes) {
            // less member access
            let { type, value } = attr; // call 'attr' once

            if (type === 'JSXAttribute') {
              if (!value) {
                value = { type: 'Literal', value: true };
              }
              let key: ASTNode;
              if (attr.name.name.indexOf('-') > -1) {
                key = { type: 'Literal', value: attr.name.name };
              } else {
                key = { name: attr.name.name, type: 'Identifier' };
              }

              const createdProp: ASTNode = {
                computed: false,
                key: key,
                kind: 'init',
                method: false,
                shorthand: false,
                type: 'Property',
                value: value,
              };

              if (newObj) {
                propObject = {
                  properties: [createdProp],
                  type: 'ObjectExpression',
                };
                newObj = false;
              } else {
                propObject.properties.push(createdProp);
              }
            }

            if (type === 'JSXSpreadAttribute') {
              spreaded = true;
              if (propObject) propObjects.push(propObject);
              else
                propObjects.push({
                  properties: [],
                  type: 'ObjectExpression',
                });
              newObj = true;
              propObjects.push(attr.argument);
            }
          }

          if (spreaded) {
            props = createObjectAssignExpression();

            props.arguments = propObjects;
          } else if (propObject) {
            props = propObject;
          } else props = { type: 'Literal', value: null };

          return {
            replaceWith: createElement([openingElement.name, props].concat(node.children)),
          };
        case 'JSXExpressionContainer':
        case 'JSXSpreadChild':
          if (node.expression.type === 'JSXEmptyExpression') return { removeNode: true };
          return { replaceWith: node.expression };
        case 'JSXFragment':
          return {
            replaceWith: createElement([JSXFragment, { type: 'Literal', value: null } as ASTNode].concat(node.children)),
          };
        case 'JSXIdentifier':
          if (name[0] === name[0].toLowerCase()) {
            return { replaceWith: { type: 'Literal', value: name } };
          }
          node.type = 'Identifier';
          return { replaceWith: node };
        case 'JSXMemberExpression':
          node.type = 'MemberExpression';
          // it's important to replace it, since it will be re-visited and picked up by other transformers
          // for example Import transformer
          return { replaceWith: node };
        case 'JSXText':
          if (node.value.indexOf('\n') > -1 && !node.value.trim()) {
            return { removeNode: true };
          }
          return {
            replaceWith: { type: 'Literal', value: node.value },
          };
      }
    },
    onTopLevelTraverse: (visit: IVisit) => {
      const { jsxFactory } = visit.globalContext;
      if (jsxFactory && !customJsxFactory) {
        // make sure we only apply it once
        customJsxFactory = true;
        const [first, second] = jsxFactory.split('.');
        createElement = createJSXFactory({ first, second });
      }
    }
  }
}
