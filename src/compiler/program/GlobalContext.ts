import { ASTNode } from '../interfaces/AST';
import { IProgramProps } from './transpileModule';

export interface GlobalContext {
  completeCallbacks?: Array<() => void>;
  jsxFactory?: string;
  namespace?: string;
  programProps?: IProgramProps;
  exportAfterDeclaration?: {
    [key: string]: {
      target?: string;
    };
  };
  hoisted: { [key: string]: number };
  identifierReplacement: {
    [key: string]: {
      first?: string;
      second?: string;
      insertAfter?: ASTNode;
      inUse?: boolean;
    };
  };
  getNextIndex: () => number;
  getNextSystemVariable: () => string;
}

const Letters = ['a', 'b', 'c', 'd', 'f', 'g', 'h', 'i'];

export function createGlobalContext(userContext?: { [key: string]: any }): GlobalContext {
  let VARIABLE_COUNTER = -1;
  let index = 1;
  let essentialContext = {
    completeCallbacks: [],
    hoisted: {},

    identifierReplacement: {},
    namespace: 'exports',
    getNextIndex: () => index++,
    getNextSystemVariable: () => {
      //return `_${++VARIABLE_COUNTER}_`;
      return `_${Letters[++VARIABLE_COUNTER]}`;
    },
  };
  if (userContext) {
    for (const key in userContext) {
      essentialContext[key] = userContext[key];
    }
  }

  return essentialContext;
}
