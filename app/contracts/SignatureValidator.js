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
class SignatureValidator extends typechain_runtime_1.TypeChainContract {
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
            }
        ];
        super(web3, address, abi);
    }
    static createAndValidate(web3, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = new SignatureValidator(web3, address);
            const code = yield typechain_runtime_1.promisify(web3.eth.getCode, [address]);
            if (code.length < 4) {
                throw new Error(`Contract at ${address} doesn't exist!`);
            }
            return contract;
        });
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
}
exports.SignatureValidator = SignatureValidator;
