import js from '@eslint/js'
import react from 'eslint-plugin-react'
import hooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  {ignores:['dist','node_modules']},
  js.configs.recommended,
  {
    files:['**/*.{js,jsx}'],
    languageOptions:{ecmaVersion:2023,sourceType:'module',globals:{...globals.browser},parserOptions:{ecmaFeatures:{jsx:true}}},
    plugins:{react,'react-hooks':hooks},
    settings:{react:{version:'detect'}},
    rules:{...hooks.configs.recommended.rules,'react/jsx-uses-vars':'error','no-unused-vars':['warn',{varsIgnorePattern:'^[A-Z]'}]},
  },
]
