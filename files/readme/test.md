### Testing Files

Included when `[useDefaults || useTesting]` is `true`.

```
.
+-- __mocks__
|   +-- fileMock.js
+-- src
|   +-- index.test.js
```

- **`__mocks__`** - contains mock files for [jest](https://www.npmjs.com/package/jest) test suite.
- **`src/index.test.js`** - boilerplate test file containing a simple test to confirm the test suite is hooked up.
