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
class ZincAccessor extends typechain_runtime_1.TypeChainContract {
    constructor(web3, address) {
        const abi = [
            {
                constant: true,
                inputs: [
                    { name: "_message1", type: "string" },
                    { name: "_nonce", type: "uint32" },
                    { name: "_header1", type: "string" },
                    { name: "_header2", type: "string" },
                    { name: "_r", type: "bytes32" },
                    { name: "_s", type: "bytes32" },
                    { name: "_v", type: "uint8" }
                ],
                name: "checkSignature",
                outputs: [{ name: "", type: "address" }],
                payable: false,
                stateMutability: "pure",
                type: "function"
            },
            {
                constant: true,
                inputs: [],
                name: "nonce",
                outputs: [{ name: "", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                constant: true,
                inputs: [
                    { name: "_userAddress", type: "address" },
                    { name: "_message1", type: "string" },
                    { name: "_nonce", type: "uint32" },
                    { name: "_header1", type: "string" },
                    { name: "_header2", type: "string" },
                    { name: "_r", type: "bytes32" },
                    { name: "_s", type: "bytes32" },
                    { name: "_v", type: "uint8" }
                ],
                name: "checkUserSignature",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "pure",
                type: "function"
            },
            {
                constant: false,
                inputs: [
                    { name: "_userAddress", type: "address" },
                    { name: "_message1", type: "string" },
                    { name: "_nonce", type: "uint32" },
                    { name: "_header1", type: "string" },
                    { name: "_header2", type: "string" },
                    { name: "_r", type: "bytes32" },
                    { name: "_s", type: "bytes32" },
                    { name: "_v", type: "uint8" }
                ],
                name: "constructUserIdentity",
                outputs: [{ name: "", type: "address" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: false,
                inputs: [
                    { name: "_key", type: "address" },
                    { name: "_idContract", type: "address" },
                    { name: "_purpose", type: "uint8" },
                    { name: "_userAddress", type: "address" },
                    { name: "_message1", type: "string" },
                    { name: "_nonce", type: "uint32" },
                    { name: "_header1", type: "string" },
                    { name: "_header2", type: "string" },
                    { name: "_r", type: "bytes32" },
                    { name: "_s", type: "bytes32" },
                    { name: "_v", type: "uint8" }
                ],
                name: "addAccessor",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: false,
                inputs: [
                    { name: "_key", type: "address" },
                    { name: "_idContract", type: "address" },
                    { name: "_userAddress", type: "address" },
                    { name: "_message1", type: "string" },
                    { name: "_nonce", type: "uint32" },
                    { name: "_header1", type: "string" },
                    { name: "_header2", type: "string" },
                    { name: "_r", type: "bytes32" },
                    { name: "_s", type: "bytes32" },
                    { name: "_v", type: "uint8" }
                ],
                name: "removeAccessor",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            }
        ];
        super(web3, address, abi);
    }
    static createAndValidate(web3, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = new ZincAccessor(web3, address);
            const code = yield typechain_runtime_1.promisify(web3.eth.getCode, [address]);
            if (code.length < 4) {
                throw new Error(`Contract at ${address} doesn't exist!`);
            }
            return contract;
        });
    }
    get nonce() {
        return typechain_runtime_1.promisify(this.rawWeb3Contract.nonce, []);
    }
    checkSignature(_message1, _nonce, _header1, _header2, _r, _s, _v) {
        return typechain_runtime_1.promisify(this.rawWeb3Contract.checkSignature, [
            _message1.toString(),
            _nonce.toString(),
            _header1.toString(),
            _header2.toString(),
            _r.toString(),
            _s.toString(),
            _v.toString()
        ]);
    }
    checkUserSignature(_userAddress, _message1, _nonce, _header1, _header2, _r, _s, _v) {
        return typechain_runtime_1.promisify(this.rawWeb3Contract.checkUserSignature, [
            _userAddress.toString(),
            _message1.toString(),
            _nonce.toString(),
            _header1.toString(),
            _header2.toString(),
            _r.toString(),
            _s.toString(),
            _v.toString()
        ]);
    }
    constructUserIdentityTx(_userAddress, _message1, _nonce, _header1, _header2, _r, _s, _v) {
        return new typechain_runtime_1.DeferredTransactionWrapper(this, "constructUserIdentity", [
            _userAddress.toString(),
            _message1.toString(),
            _nonce.toString(),
            _header1.toString(),
            _header2.toString(),
            _r.toString(),
            _s.toString(),
            _v.toString()
        ]);
    }
    addAccessorTx(_key, _idContract, _purpose, _userAddress, _message1, _nonce, _header1, _header2, _r, _s, _v) {
        return new typechain_runtime_1.DeferredTransactionWrapper(this, "addAccessor", [
            _key.toString(),
            _idContract.toString(),
            _purpose.toString(),
            _userAddress.toString(),
            _message1.toString(),
            _nonce.toString(),
            _header1.toString(),
            _header2.toString(),
            _r.toString(),
            _s.toString(),
            _v.toString()
        ]);
    }
    removeAccessorTx(_key, _idContract, _userAddress, _message1, _nonce, _header1, _header2, _r, _s, _v) {
        return new typechain_runtime_1.DeferredTransactionWrapper(this, "removeAccessor", [
            _key.toString(),
            _idContract.toString(),
            _userAddress.toString(),
            _message1.toString(),
            _nonce.toString(),
            _header1.toString(),
            _header2.toString(),
            _r.toString(),
            _s.toString(),
            _v.toString()
        ]);
    }
}
exports.ZincAccessor = ZincAccessor;
