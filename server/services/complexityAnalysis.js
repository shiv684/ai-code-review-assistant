const acorn = require('acorn');
const walk = require('acorn-walk');

function analyzeComplexity(sourceCode) {
  let ast;

  try {
    ast = acorn.parse(sourceCode, {
      ecmaVersion: 2021,
      sourceType: 'module',
      allowReturnOutsideFunction: true,
      locations: true,
    });
  } catch (err) {
    // Code could not be parsed (syntax error) — return empty metrics
    return {
      linesOfCode: sourceCode.split('\n').length,
      functionCount: 0,
      classCount: 0,
      functions: [],
      averageComplexity: 0,
      parseError: true,
    };
  }

  const functions = [];
  let classCount = 0;

  // Calculates cyclomatic complexity for a single function node
  function calculateFunctionComplexity(node) {
    let complexity = 1; // base path

    walk.simple(node, {
      IfStatement() { complexity++; },
      ForStatement() { complexity++; },
      ForInStatement() { complexity++; },
      ForOfStatement() { complexity++; },
      WhileStatement() { complexity++; },
      DoWhileStatement() { complexity++; },
      SwitchCase() { complexity++; },
      CatchClause() { complexity++; },
      ConditionalExpression() { complexity++; }, // ternary (a ? b : c)
      LogicalExpression(n) {
        if (n.operator === '&&' || n.operator === '||') complexity++;
      },
    });

    return complexity;
  }

  // Walk the whole AST to find all functions and classes
  walk.simple(ast, {
    FunctionDeclaration(node) {
      functions.push({
        name: node.id ? node.id.name : 'anonymous',
        line: node.loc ? node.loc.start.line : null,
        complexity: calculateFunctionComplexity(node),
      });
    },
    FunctionExpression(node) {
      functions.push({
        name: node.id ? node.id.name : 'anonymous',
        line: node.loc ? node.loc.start.line : null,
        complexity: calculateFunctionComplexity(node),
      });
    },
    ArrowFunctionExpression(node) {
      functions.push({
        name: 'arrow function',
        line: node.loc ? node.loc.start.line : null,
        complexity: calculateFunctionComplexity(node),
      });
    },
    ClassDeclaration() {
      classCount++;
    },
  });

  const linesOfCode = sourceCode.split('\n').filter((line) => line.trim() !== '').length;
  const totalComplexity = functions.reduce((sum, f) => sum + f.complexity, 0);
  const averageComplexity = functions.length > 0
    ? +(totalComplexity / functions.length).toFixed(1)
    : 1;

  return {
    linesOfCode,
    functionCount: functions.length,
    classCount,
    functions,
    averageComplexity,
    parseError: false,
  };
}

module.exports = { analyzeComplexity };