# Stack Spike

This project uses [yarn][yarn] to manage project dependencies.

Please ensure you [install][yarn-install] and use it in place of npm.

## IDE Plugins

Please install the following plugins for your IDE:

* [EditorConfig](http://editorconfig.org/#download)
* [Prettier](https://prettier.io/docs/en/editors.html)
* [TSLint](https://palantir.github.io/tslint)

## Scripts

| Command              | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| `yarn dev`           | Runs the server in development mode watching the source files for changes. |
| `yarn build`         | Compiles the TypeScript source files into a `lib` directory.               |
| `yarn start`         | Runs the server from the compiled JavaScript files in the `lib` directory. |
| `yarn reset`         | Deletes the `lib` and `coverage` directories.                              |
| `yarn test`          | Runs the test suite.                                                       |
| `yarn test-watch`    | Runs the test suite in watch mode. Useful during development.              |
| `yarn test-coverage` | Runs the test suite and produces a coverage report.                        |
| `yarn lint`          | Lints the source TypeScript files using [TSLint][tslint].                  |
| `yarn format`        | Formats all files using [Prettier][prettier].                              |

When committing files to git, a `precommit` hook automatically runs the `format`, `lint` and `test` scripts.

If any of these scripts fail, the commit will be rejected.

[prettier]: https://prettier.io
[tslint]: https://palantir.github.io/tslint
[yarn]: https://yarnpkg.com
[yarn-install]: https://yarnpkg.com/en/docs/install
