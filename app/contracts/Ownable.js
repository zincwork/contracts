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
class Ownable extends typechain_runtime_1.TypeChainContract {
    constructor(web3, address) {
        const abi = [
            {
                constant: true,
                inputs: [],
                name: "owner",
                outputs: [{ name: "", type: "address" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                inputs: [],
                payable: false,
                stateMutability: "nonpayable",
                type: "constructor"
            },
            {
                anonymous: false,
                inputs: [{ indexed: true, name: "previousOwner", type: "address" }],
                name: "OwnershipRenounced",
                type: "event"
            },
            {
                anonymous: false,
                inputs: [
                    { indexed: true, name: "previousOwner", type: "address" },
                    { indexed: true, name: "newOwner", type: "address" }
                ],
                name: "OwnershipTransferred",
                type: "event"
            },
            {
                constant: false,
                inputs: [],
                name: "renounceOwnership",
                outputs: [],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: false,
                inputs: [{ name: "_newOwner", type: "address" }],
                name: "transferOwnership",
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
            const contract = new Ownable(web3, address);
            const code = yield typechain_runtime_1.promisify(web3.eth.getCode, [address]);
            if (code.length < 4) {
                throw new Error(`Contract at ${address} doesn't exist!`);
            }
            return contract;
        });
    }
    get owner() {
        return typechain_runtime_1.promisify(this.rawWeb3Contract.owner, []);
    }
    renounceOwnershipTx() {
        return new typechain_runtime_1.DeferredTransactionWrapper(this, "renounceOwnership", []);
    }
    transferOwnershipTx(_newOwner) {
        return new typechain_runtime_1.DeferredTransactionWrapper(this, "transferOwnership", [_newOwner.toString()]);
    }
    OwnershipRenouncedEvent(eventFilter) {
        return new typechain_runtime_1.DeferredEventWrapper(this, "OwnershipRenounced", eventFilter);
    }
    OwnershipTransferredEvent(eventFilter) {
        return new typechain_runtime_1.DeferredEventWrapper(this, "OwnershipTransferred", eventFilter);
    }
}
exports.Ownable = Ownable;
