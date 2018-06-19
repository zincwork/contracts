import { assert } from "chai"
import { IRegistryInstance } from "../contracts/registry"

declare function contract(
  name: string,
  test: (accounts: string[]) => void
): void

declare function it(name: string, test: (accounts: string[]) => void): void

declare const artifacts: Iartifacts

interface Iartifacts {
  require(name: "Registry"): Icontract<IRegistryInstance>
}

interface Icontract<T> {
  "new"(...args: any[]): Promise<T>
  deployed(): Promise<T>
  at(address: string): T
}

const Registry = artifacts.require("Registry")

const subject = "0x627306090abab3a6e1400e9345bc60c78a8bef57" // = accounts[0] = owner
const issuer = "0xf17f52151ebef6c7334fad080c5704d77216b732" // = accounts[1]
const issuer2 = "0xdeadbeef1ebef6c7334fad080c5704d77216b732"
const id = "0x308cc5f7b4fe1e2ff905e309c501118487de4e83000000000000000000000000"
const key = "0x308cc5f7b4fe1e2ff905e309c501118487de4e84000000000000000000000000"
const data =
  "0x308cc5f7b4fe1e2ff905e309c501118487de4e85000000000000000000000000"

contract("Registry", (accounts) => {
  it("owner can add claim for less than 38000 gas", async () => {
    const registry = await Registry.new()
    await registry.setClaim(subject, issuer, id, key, data, {
      gas: 1000000
    })
    let totalGas = 0
    totalGas += await registry.setClaim.estimateGas(
      subject,
      issuer,
      id,
      key,
      data,
      { gas: 1000000 }
    )
    assert.isBelow(totalGas, 38000)
  })

  it("issuer can add claim", async () => {
    const registry = await Registry.new()
    await registry.setClaim(
      subject,
      issuer,
      id,
      key,
      data,
      { from: accounts[1], gas: 1000000 } // msg.sender = issuer
    )
  })

  it("add claim method throws if sender isn't issuer or owner", async () => {
    const registry = await Registry.new()
    await registry
      .setClaim(
        "0xf17f52151ebef6c7334fad080c5704d77216b732",
        "0x627306090abab3a6e1400e9345bc60c78a8bef57",
        id,
        key,
        data,
        { from: accounts[1], gas: 1000000 } // msg.sender = subject
      )
      .then(assert.fail)
      .catch((error: any) => {
        assert.include(
          error.message,
          "Exception while processing transaction: revert",
          "didn't throw a revert exception."
        )
      })
  })

  it("emits ClaimSet event", async () => {
    const registry = await Registry.new()
    const result = await registry.setClaim(subject, issuer, id, key, data, {
      gas: 1000000
    })
    assert.deepEqual(result.logs[0].args, {
      subject,
      issuer,
      id,
      key,
      data,
      updatedAt: result.logs[0].args.updatedAt
    })
  })

  it("gets claim", async () => {
    const registry = await Registry.new()
    await registry.setClaim(subject, issuer, id, key, data, {
      gas: 1000000
    })
    const receivedData = await registry.getClaim.call(subject, issuer, id, key)
    assert.deepEqual(receivedData, data)
  })

  it("subject can remove claim for less than 21000 gas", async () => {
    const registry = await Registry.new()
    await registry.setClaim(subject, issuer, id, key, data, {
      gas: 1000000
    })
    let totalGas = 0
    totalGas += await registry.removeClaim.estimateGas(subject, issuer, id, key)
    assert.isBelow(totalGas, 21000)
    await registry.removeClaim(subject, issuer, id, key)
    const receivedData2 = await registry.getClaim.call(subject, issuer, id, key)
    assert.deepEqual(
      receivedData2,
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    )
  })

  it("issuer can remove claim", async () => {
    const registry = await Registry.new()
    await registry.setClaim(subject, issuer, id, key, data, {
      gas: 1000000
    })
    await registry.removeClaim(subject, issuer, id, key, {
      from: accounts[1] // msg.sender = issuer
    })
    const receivedData3 = await registry.getClaim.call(subject, issuer, id, key)
    assert.deepEqual(
      receivedData3,
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    )
  })

  it("owner can remove claim", async () => {
    const registry = await Registry.new()
    await registry.setClaim(
      "0xdeadbeef0abab3a6e1400e9345bc60c78a8bef57",
      "0xdeadbeef0abab3a6e1400e9345bc60c78a8bef57",
      id,
      key,
      data,
      {
        gas: 1000000
      }
    )
    await registry.removeClaim(
      "0xdeadbeef0abab3a6e1400e9345bc60c78a8bef57",
      "0xdeadbeef0abab3a6e1400e9345bc60c78a8bef57",
      id,
      key,
      {
        from: accounts[0] // msg.sender = owner
      }
    )
    const receivedData4 = await registry.getClaim.call(
      "0xdeadbeef0abab3a6e1400e9345bc60c78a8bef57",
      "0xdeadbeef0abab3a6e1400e9345bc60c78a8bef57",
      id,
      key
    )
    assert.deepEqual(
      receivedData4,
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    )
  })

  it("remove claim method throws if sender isn't subject/issuer/owner", async () => {
    const registry = await Registry.new()
    await registry.setClaim(subject, issuer, id, key, data, {
      gas: 1000000
    })
    await registry
      .removeClaim(subject, issuer, id, key, { from: accounts[2] }) // msg.sender != issuer && != subject && != owner
      .then(assert.fail)
      .catch((error: any) => {
        assert.include(
          error.message,
          "Exception while processing transaction: revert",
          "didn't throw a revert exception."
        )
      })
    const receivedData6 = await registry.getClaim.call(subject, issuer, id, key)
    assert.deepEqual(receivedData6, data)
  })

  it("emits ClaimRemoved event", async () => {
    const registry = await Registry.new()
    await registry.setClaim(subject, issuer, id, key, data, {
      gas: 1000000
    })
    const remove = await registry.removeClaim(subject, issuer, id, key)
    assert.deepEqual(remove.logs[0].args, {
      subject,
      issuer,
      id,
      key,
      removedAt: remove.logs[0].args.removedAt
    })
  })

  it("Owner can amend claim", async () => {
    const registry = await Registry.new()
    await registry.setClaim(subject, issuer, id, key, data, {
      gas: 1000000
    })
    const remove = await registry.amendClaim(subject, issuer2, issuer, id, key)
    const cost = await registry.amendClaim.estimateGas(
      subject,
      issuer2,
      issuer,
      id,
      key
    )

    // check that appropriate events have been fired
    assert.deepEqual(remove.logs[0].args, {
      subject,
      issuer,
      id,
      key,
      removedAt: remove.logs[0].args.removedAt
    })
    assert.deepEqual(remove.logs[1].args, {
      subject,
      issuer: issuer2,
      id,
      key,
      data,
      updatedAt: remove.logs[1].args.updatedAt
    })
    assert.isBelow(cost, 38000)
  })

  it("Non-owner can't amend claim", async () => {
    const registry = await Registry.new()
    await registry.setClaim(subject, issuer, id, key, data, {
      gas: 1000000
    })
    await registry
      .amendClaim(subject, issuer2, issuer, id, key, {
        gas: 1000000,
        from: issuer
      })
      .then(assert.fail)
      .catch((error: any) => {
        assert.include(
          error.message,
          "Exception while processing transaction: revert",
          "didn't throw a revert exception."
        )
      })
  })
})
