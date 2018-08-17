

This project uses [yarn][yarn] to manage project dependencies.

Please ensure you [install][yarn-install] and use it in place of npm.

## IDE Plugins

Please install the following plugins for your IDE:

* [EditorConfig](http://editorconfig.org/#download)
* [Prettier](https://prettier.io/docs/en/editors.html)
* [TSLint](https://palantir.github.io/tslint)

## Scripts

| Command       | Description                                                                        |
| ------------- | ---------------------------------------------------------------------------------- |
| `yarn build`  | Compiles the Solidity source files into JSON (ABI) located in a `build` directory. |
| `yarn test`   | Compiles all TypeScript files and runs the truffle test suite.                     |
| `yarn reset`  | Deletes the `build` directories and compiled `test.js` files.                      |
| `yarn lint`   | Lints the source TypeScript files using [TSLint][tslint].                          |
| `yarn format` | Formats all files using [Prettier][prettier].                                      |

[prettier]: https://prettier.io
[tslint]: https://palantir.github.io/tslint
[yarn]: https://yarnpkg.com
[yarn-install]: https://yarnpkg.com/en/docs/install
