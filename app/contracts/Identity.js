"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typechain_runtime_1 = require("./typechain-runtime");
class Identity extends typechain_runtime_1.TypeChainContract {
    constructor(web3, address) {
        const abi = [
            {
                inputs: [
                    { name: "_initialAccessors", type: "address[]" },
                    { name: "purposes", type: "uint8[]" }
                ],
                payable: false,
                stateMutability: "nonpayable",
                type: "constructor"
            },
            { payable: true, stateMutability: "payable", type: "fallback" },
            {
                anonymous: false,
                inputs: [
                    { indexed: true, name: "key", type: "address" },
                    { indexed: true, name: "purpose", type: "uint8" }
                ],
                name: "AccessorAdded",
                type: "event"
            },
            {
                anonymous: false,
                inputs: [
                    { indexed: true, name: "key", type: "address" },
                    { indexed: true, name: "purpose", type: "uint8" }
                ],
                name: "AccessorRemoved",
                type: "event"
            },
            {
                anonymous: false,
                inputs: [
                    { indexed: true, name: "key", type: "address" },
                    { indexed: true, name: "oldPurpose", type: "uint8" },
                    { indexed: true, name: "newPurpose", type: "uint8" }
                ],
                name: "AccessorUpdated",
                type: "event"
            },
            {
                constant: true,
                inputs: [{ name: "_key", type: "address" }],
                name: "getAccessorPurpose",
                outputs: [{ name: "", type: "uint8" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                constant: false,
                inputs: [
                    { name: "_key", type: "address" },
                    { name: "_purpose", type: "uint8" }
                ],
                name: "addAccessor",
                outputs: [],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: false,
                inputs: [{ name: "_key", type: "address" }],
                name: "removeAccessor",
                outputs: [],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: false,
                inputs: [],
                name: "withdraw",
                outputs: [],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: false,
                inputs: [
                    { name: "_amount", type: "uint256" },
                    { name: "_account", type: "address" }
                ],
                name: "transferEth",
                outputs: [],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: true,
                inputs: [],
                name: "getBalance",
                outputs: [{ name: "", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                constant: true,
                inputs: [{ name: "_token", type: "address" }],
                name: "getTokenBalance",
                outputs: [{ name: "", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                constant: false,
                inputs: [{ name: "_token", type: "address" }],
                name: "withdrawTokens",
                outputs: [],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: false,
                inputs: [
                    { name: "_token", type: "address" },
                    { name: "_to", type: "address" },
                    { name: "_amount", type: "uint256" }
                ],
                name: "transferTokens",
                outputs: [],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            }
        ];
        super(web3, address, abi);
    }
    static createAndValidate(web3, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = new Identity(web3, address);
            const code = yield typechain_runtime_1.promisify(web3.eth.getCode, [address]);
            if (code.length < 4) {
                throw new Error(`Contract at ${address} doesn't exist!`);
            }
            return contract;
        });
    }
    get getBalance() {
        return typechain_runtime_1.promisify(this.rawWeb3Contract.getBalance, []);
    }
    getAccessorPurpose(_key) {
        return typechain_runtime_1.promisify(this.rawWeb3Contract.getAccessorPurpose, [_key.toString()]);
    }
    getTokenBalance(_token) {
        return typechain_runtime_1.promisify(this.rawWeb3Contract.getTokenBalance, [_token.toString()]);
    }
    addAccessorTx(_key, _purpose) {
        return new typechain_runtime_1.DeferredTransactionWrapper(this, "addAccessor", [
            _key.toString(),
            _purpose.toString()
        ]);
    }
    removeAccessorTx(_key) {
        return new typechain_runtime_1.DeferredTransactionWrapper(this, "removeAccessor", [
            _key.toString()
        ]);
    }
    withdrawTx() {
        return new typechain_runtime_1.DeferredTransactionWrapper(this, "withdraw", []);
    }
    transferEthTx(_amount, _account) {
        return new typechain_runtime_1.DeferredTransactionWrapper(this, "transferEth", [
            _amount.toString(),
            _account.toString()
        ]);
    }
    withdrawTokensTx(_token) {
        return new typechain_runtime_1.DeferredTransactionWrapper(this, "withdrawTokens", [
            _token.toString()
        ]);
    }
    transferTokensTx(_token, _to, _amount) {
        return new typechain_runtime_1.DeferredTransactionWrapper(this, "transferTokens", [
            _token.toString(),
            _to.toString(),
            _amount.toString()
        ]);
    }
    AccessorAddedEvent(eventFilter) {
        return new typechain_runtime_1.DeferredEventWrapper(this, "AccessorAdded", eventFilter);
    }
    AccessorRemovedEvent(eventFilter) {
        return new typechain_runtime_1.DeferredEventWrapper(this, "AccessorRemoved", eventFilter);
    }
    AccessorUpdatedEvent(eventFilter) {
        return new typechain_runtime_1.DeferredEventWrapper(this, "AccessorUpdated", eventFilter);
    }
}
exports.Identity = Identity;
