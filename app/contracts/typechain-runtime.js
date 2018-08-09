"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TypeChainContract {
    constructor(web3, address, contractAbi) {
        this.contractAbi = contractAbi;
        this.address = address.toString();
        this.rawWeb3Contract = web3.eth.contract(contractAbi).at(address);
    }
}
exports.TypeChainContract = TypeChainContract;
class DeferredTransactionWrapper {
    constructor(parentContract, methodName, methodArgs) {
        this.parentContract = parentContract;
        this.methodName = methodName;
        this.methodArgs = methodArgs;
    }
    send(params, customWeb3) {
        let method;
        if (customWeb3) {
            const tmpContract = customWeb3.eth
                .contract(this.parentContract.contractAbi)
                .at(this.parentContract.address);
            method = tmpContract[this.methodName].sendTransaction;
        }
        else {
            method = this.parentContract.rawWeb3Contract[this.methodName].sendTransaction;
        }
        return promisify(method, [...this.methodArgs, params]);
    }
    getData() {
        return this.parentContract.rawWeb3Contract[this.methodName].getData(...this.methodArgs);
    }
}
exports.DeferredTransactionWrapper = DeferredTransactionWrapper;
class DeferredEventWrapper {
    constructor(parentContract, eventName, eventArgs) {
        this.parentContract = parentContract;
        this.eventName = eventName;
        this.eventArgs = eventArgs;
    }
    watchFirst(watchFilter) {
        return new Promise((resolve, reject) => {
            const watchedEvent = this.getRawEvent(watchFilter);
            watchedEvent.watch((err, res) => {
                watchedEvent.stopWatching((err2, res2) => {
                    if (err) {
                        reject(err);
                    }
                    else if (err2) {
                        reject(err2);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
    watch(watchFilter, callback) {
        const watchedEvent = this.getRawEvent(watchFilter);
        watchedEvent.watch(callback);
        return () => {
            return new Promise((resolve, reject) => {
                watchedEvent.stopWatching((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        };
    }
    get(watchFilter) {
        return new Promise((resolve, reject) => {
            const watchedEvent = this.getRawEvent(watchFilter);
            watchedEvent.get((err, logs) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(logs);
                }
            });
        });
    }
    getRawEvent(watchFilter) {
        const filter = Object.assign({}, {
            fromBlock: "0",
            toBlock: "latest",
        }, watchFilter);
        const rawEvent = this.parentContract.rawWeb3Contract[this.eventName](this.eventArgs, filter);
        return rawEvent;
    }
}
exports.DeferredEventWrapper = DeferredEventWrapper;
function promisify(func, args) {
    return new Promise((res, rej) => {
        func(...args, (err, data) => {
            if (err)
                return rej(err);
            return res(data);
        });
    });
}
exports.promisify = promisify;
