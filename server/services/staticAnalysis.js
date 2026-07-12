const { ESLint } = require('eslint');

// ek reusable function jo kisi bhi code string ko lint kare
async function runStaticAnalysis(sourceCode) {
  const eslint = new ESLint({
    useEslintrc: false, // humare server ka apna .eslintrc use na ho, isliye false
    overrideConfig: {
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      env: {
        es2021: true,
        node: true,
        browser: true,
      },
      rules: {
        'no-unused-vars': 'warn',
        'no-undef': 'error',
        'no-var': 'warn',
        eqeqeq: 'warn',
        semi: ['warn', 'always'],
        quotes: ['warn', 'single'],
        'no-console': 'off',
        'no-empty': 'warn',
        'no-duplicate-imports': 'error',
      },
    },
  });

  const results = await eslint.lintText(sourceCode);
  // lintText ek array deta hai, hum single-file text de rahe hain isliye [0]
  return results[0].messages;
}

module.exports = { runStaticAnalysis };