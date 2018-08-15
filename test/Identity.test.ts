import { assert } from "chai"

const IdentityContract = artifacts.require("Identity")

const StandardToken = artifacts.require("StandardToken")

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

    const receipt: any = await id.addAccessor(
      "0x91f04cfa7c6c26cb080cc00e100403ca3bb86211",
      4,
      {
        from: accounts[1],
        gas: 100000
      }
    )
    // actual gas cost 45669
    assert(
      receipt.receipt.gasUsed < 50000,
      "Too much gas used to add accessor from Identity"
    )

    const accessor = await id.getAccessorPurpose(
      "0x91f04cfa7c6c26cb080cc00e100403ca3bb86211"
    )

    assert.deepStrictEqual(accessor.toNumber(), 4)
  })

  it("can't add accessor with purpose > 15", async () => {
    const id = await IdentityContract.new(
      ["0xa3ac565e34f709247933b14340af32875dfdcab5", accounts[1]],
      [7, 15]
    )

    try {
      await id.addAccessor("0x91f04cfa7c6c26cb080cc00e100403ca3bb86211", 16, {
        from: accounts[1],
        gas: 100000
      })
    } catch (e) {
      assert.deepStrictEqual(
        e.message,
        "VM Exception while processing transaction: revert"
      )
    }
  })

  it("can remove accessor", async () => {
    const id = await IdentityContract.new(
      ["0xa3ac565e34f709247933b14340af32875dfdcab5", accounts[1]],
      [7, 15]
    )

    const receipt: any = await id.removeAccessor(
      "0xa3ac565e34f709247933b14340af32875dfdcab5",
      {
        from: accounts[1],
        gas: 100000
      }
    )

    // actual gas used 15137
    assert(
      receipt.receipt.gasUsed < 16000,
      "Too much gas used to remove accessor from Identity"
    )

    const purpose = await id.getAccessorPurpose(
      "0xa3ac565e34f709247933b14340af32875dfdcab5"
    )

    assert.deepStrictEqual(purpose.toNumber(), 0)
  })

  it("can send and retrieve eth", async () => {
    const id = await IdentityContract.new(
      ["0xa3ac565e34f709247933b14340af32875dfdcab5", accounts[1]],
      [7, 15]
    )

    const val = parseInt(web3.toWei(1, "ether"), 10)
    await id.sendTransaction({
      from: accounts[1],
      value: val
    })

    const contractBalance = web3.fromWei(
      web3.eth.getBalance(id.address).toString(),
      "ether"
    )
    // comparison is done in eth
    assert.deepStrictEqual(parseInt(contractBalance, 10), 1)

    const receipt: any = await id.withdraw({ from: accounts[1] })

    // actual gas used 29663
    assert(
      receipt.receipt.gasUsed < 30000,
      "Too much gas used to withdraw funds"
    )

    const contractNewBalance = web3.fromWei(
      web3.eth.getBalance(id.address).toString(),
      "ether"
    )
    // comparison is done in eth
    assert.deepStrictEqual(parseInt(contractNewBalance, 10), 0)
  })

  it("person with non funds management privileges cannot withdraw", async () => {
    const id = await IdentityContract.new(
      ["0xa3ac565e34f709247933b14340af32875dfdcab5", accounts[1]],
      [7, 15]
    )
    const val = parseInt(web3.toWei(1, "ether"), 10)
    await id.sendTransaction({
      from: accounts[1],
      value: val
    })

    const contractBalance = web3.fromWei(
      web3.eth.getBalance(id.address).toString(),
      "ether"
    )
    // comparison is done in eth
    assert.deepStrictEqual(parseInt(contractBalance, 10), 1)

    try {
      await id.withdraw({ from: accounts[0] })
    } catch (error) {
      assert.deepStrictEqual(
        error.message,
        "VM Exception while processing transaction: revert"
      )
    }
  })

  it("can receive and withdraw erc20 tokens", async () => {
    const token = await StandardToken.new(100)
    const accountTokenBalance = await token.balanceOf(accounts[0])
    assert.deepStrictEqual(accountTokenBalance.toNumber(), 100)

    const id = await IdentityContract.new(
      ["0xa3ac565e34f709247933b14340af32875dfdcab5", accounts[0]],
      [7, 15]
    )

    const receipt: any = await token.transfer(id.address, 100, {
      from: accounts[0]
    })

    // actual gas used 36496
    assert(receipt.receipt.gasUsed < 37000)

    const balance = await token.balanceOf(id.address)
    assert.deepStrictEqual(balance.toNumber(), 100)
    assert.deepStrictEqual(
      balance.toNumber(),
      (await id.getTokenBalance(token.address)).toNumber()
    )

    const rec: any = await id.transferTokens(token.address, accounts[1], 100)
    const accountTokenBalance1 = await token.balanceOf(accounts[1])

    // actual gas used 43070
    assert(rec.receipt.gasUsed < 44000, "Too much gas used to transfer tokens")
    assert.deepStrictEqual(accountTokenBalance1.toNumber(), 100)

    assert.deepStrictEqual((await token.balanceOf(accounts[0])).toNumber(), 0)
    assert.deepStrictEqual((await token.balanceOf(id.address)).toNumber(), 0)
  })
})
