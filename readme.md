# Description

The contract architecture is inspired by ERC780 & ERC725 with a registry, the 'ZincAccessor' and individual user contracts 'UserIdentity'.

The philosophy of the achitecture is that each user will have an Identity Contract which only they control and can revoke permissions of other apps as they wish. The idea is that different dApp contracts can ask the user for permission to interact with their identity contract and the user can allow for certain permissions. The dApp contract’s address gets added to the users Identity Contract. We folllowed the upgradability ethos that the user can decide to stick with the current logic or upgrade and still use the system. 

We developed our own version of a Transaction Relay which will facilitate the user to use our platform without using gas/ether. Zinc will relay the transactions in a trustless fashion. We decided to use ECDSA signatures within the smart contract to verify user’s consent for interacting with their Identity or performing any function on their behalf. The transaction relay works by asking the user to sign a message through MetaMask, the signed message then gets relayed to the ZincAccessor contract which verifies the contents of the message through the Encoder contract and verifies the signature by using SignatureValidator, once these checks are performed, the action is performed with the Identity Contract.

![contracts](https://user-images.githubusercontent.com/23189295/70504386-97065e80-1b1d-11ea-8857-edb5b2f2daab.png)


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

## License

MIT
