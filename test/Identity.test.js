const assert = require("chai").assert
const IdentityContract = artifacts.require("../contracts/Identity.sol")

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

  it("more than 1 address has right privileges set", async () => {
    const id = await IdentityContract.new(
      [
        "0xa3ac565e34f709247933b14340af32875dfdcab5",
        "0xbd32ccace9e69756620fda04ee0b6738c9c74043",
        "0x91f04cfa7c6c26cb080cc00e100403ca3bb86211"
      ],
      [7, 15, 1]
    )
    const first = await id.getAccessorPurpose(
      "0xa3ac565e34f709247933b14340af32875dfdcab5"
    )

    const second = await id.getAccessorPurpose(
      "0xbd32ccace9e69756620fda04ee0b6738c9c74043"
    )

    const third = await id.getAccessorPurpose(
      "0x91f04cfa7c6c26cb080cc00e100403ca3bb86211"
    )
    assert.deepStrictEqual(first.toNumber(), 7)
    assert.deepStrictEqual(second.toNumber(), 15)
    assert.deepStrictEqual(third.toNumber(), 1)
  })

  it("can add accessor", async () => {
    const id = await IdentityContract.new(
      ["0xa3ac565e34f709247933b14340af32875dfdcab5", accounts[1]],
      [7, 15]
    )

    await id.addAccessor("0x91f04cfa7c6c26cb080cc00e100403ca3bb86211", 4, {
      from: accounts[1],
      gas: 4000000
    })

    const accessor = await id.getAccessorPurpose(
      "0x91f04cfa7c6c26cb080cc00e100403ca3bb86211"
    )

    assert.deepStrictEqual(accessor.toNumber(), 4)
  })

  // it("cant add accessor with purpose > 15", async () => {
  //   const id = await IdentityContract.new(
  //     [
  //       "0xa3ac565e34f709247933b14340af32875dfdcab5",
  //       "0xbd32ccace9e69756620fda04ee0b6738c9c74043"
  //     ],
  //     [7, 15]
  //   )

  //   try {
  //     await id.addAccessorTx("0x91f04cfa7c6c26cb080cc00e100403ca3bb86211", 16)
  //   } catch (e) {
  //     console.log(e)
  //   }
  // })
})
