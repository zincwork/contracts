import { assert } from "chai"
import { Identity } from "../app/contracts/Identity"

declare function contract(
  name: string,
  test: (accounts: string[]) => void
): void

declare function it(name: string, test: (accounts: string[]) => void): void

declare const artifacts: Iartifacts

interface Iartifacts {
  require(name: "Identity"): Icontract<Identity>
}

interface Icontract<T> {
  "new"(...args: any[]): Promise<T>
  deployed(): Promise<T>
  at(address: string): T
}

const IdentityContract = artifacts.require("Identity")

contract("Identity", (accounts) => {
  it("can create empty identity contract", async () => {
    const id = await IdentityContract.new([], [])
    assert.isDefined(id)
  })

  it("cannot create identity contract with unmatching arguments", async () => {
    try {
      await IdentityContract.new(
        ["0xa3ac565e34f709247933b14340af32875dfdcab5"],
        []
      )
    } catch (error) {
      assert.deepStrictEqual(
        error.message,
        "VM Exception while processing transaction: revert"
      )
    }
  })

  it("can create an identity contract and assign right privillages to it", async () => {
    const id = await IdentityContract.new(
      ["0xa3ac565e34f709247933b14340af32875dfdcab5"],
      [7]
    )
    const accessorPurpose = await id.getAccessorPurpose(
      "0xa3ac565e34f709247933b14340af32875dfdcab5"
    )
    assert.deepStrictEqual(accessorPurpose.toNumber(), 7)
  })

  it("random address has 0 privileges", async () => {
    const id = await IdentityContract.new(
      ["0xa3ac565e34f709247933b14340af32875dfdcab5"],
      [7]
    )
    const accessorPurpose = await id.getAccessorPurpose(
      "0xbd32ccace9e69756620fda04ee0b6738c9c74043"
    )
    assert.deepStrictEqual(accessorPurpose.toNumber(), 0)
  })
})
