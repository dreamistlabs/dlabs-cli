### Quality Files

Included when `[useDefaults || useQuality]` is `true`.

```
.
+-- .husky
|   +-- _
|       +-- .gitignore
|       +-- husky.sh
|   +-- commit-msg
|   +-- pre-commit
+-- .eslintignore
+-- .eslintrc.json
+-- .prettierignore
+-- .prettierrc.json
+-- commitlint.config.js
```

- **`.husky`** - contains [husky](https://www.npmjs.com/package/husky) configuration files, specifically, `commit-msg`, and `pre-commit` hooks.
- **`.eslintignore`** - the ignore file for [eslint](https://www.npmjs.com/package/eslint).
- **`.eslintrc.json`** - the configuration file for [eslint](https://www.npmjs.com/package/eslint).
- **`.prettierignore`** - the ignore file for [prettier](https://www.npmjs.com/package/prettier).
- **`.prettierrc.json`** - the configuration file for [prettier](https://www.npmjs.com/package/prettier).
- **`commitlint.config.js`** - configuration file used by [commitlint](https://www.npmjs.com/package/commitlint) and is aimed at standardizing developer's commit messages in the project. It's enforced by `husky`, in the `commit-msg` hook.
