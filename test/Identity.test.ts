import { assert } from "chai"

const IdentityContract = artifacts.require("Identity")

const StandardToken = artifacts.require("StandardToken")

contract("Identity", (accounts) => {
  it("can create identity contract", async () => {
    const id = await IdentityContract.new()
    assert.isDefined(id)
  })

  it("random address has 0 privileges", async () => {
    const id = await IdentityContract.new()
    const accessorPurpose = await id.getKeyPurpose.call(
      "0xbd32ccace9e69756620fda04ee0b6738c9c74043"
    )

    assert.deepStrictEqual(accessorPurpose, [])
  })

  it("can add accessor", async () => {
    const id = await IdentityContract.new()

    const receipt = await id.addKey(
      web3.sha3(accounts[1], { encoding: "hex" }),
      11,
      1
    ) // Give accounts[1] FUNDS_MANAGEMENT purpose

    // actual gas cost 148523
    assert(
      receipt.receipt.gasUsed < 150000,
      "Too much gas used to add accessor from Identity"
    )

    assert(
      await id.keyHasPurpose.call(
        web3.sha3(accounts[1], { encoding: "hex" }),
        11
      )
    )
  })

  it("can remove key with purpose", async () => {
    const id = await IdentityContract.new()
    await id.addKey(web3.sha3(accounts[1], { encoding: "hex" }), 11, 1) // Give accounts[1] FUNDS_MANAGEMENT purpose

    assert(
      await id.keyHasPurpose.call(
        web3.sha3(accounts[1], { encoding: "hex" }),
        11
      )
    )
    const receipt = await id.removeKey(
      web3.sha3(accounts[1], { encoding: "hex" }),
      11
    )

    // actual gas used 37678
    assert(
      receipt.receipt.gasUsed < 38000,
      "Too much gas used to remove accessor from Identity"
    )

    assert(
      !(await id.keyHasPurpose.call(
        web3.sha3(accounts[1], { encoding: "hex" }),
        11
      ))
    )
  })

  it("can send and retrieve eth", async () => {
    const id = await IdentityContract.new()
    await id.addKey(web3.sha3(accounts[1], { encoding: "hex" }), 11, 1) // Give accounts[1] FUNDS_MANAGEMENT purpose

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

    // actual gas used 30788
    assert(
      receipt.receipt.gasUsed < 31000,
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
    const id = await IdentityContract.new()
    const val = parseInt(web3.toWei(1, "ether"), 10)
    await id.addKey(web3.sha3(accounts[1], { encoding: "hex" }), 11, 1) // Give accounts[1] FUNDS_MANAGEMENT purpose
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

    const id = await IdentityContract.new()
    await id.addKey(web3.sha3(accounts[0], { encoding: "hex" }), 11, 1) // Give accounts[0] FUNDS_MANAGEMENT purpose

    const receipt = await token.transfer(id.address, 100, {
      from: accounts[0]
    })

    // actual gas used 36496
    assert(receipt.receipt.gasUsed < 37000, "Too much gas used!")

    const balance = await token.balanceOf.call(id.address)
    assert.deepStrictEqual(balance.toNumber(), 100)
    assert.deepStrictEqual(
      balance.toNumber(),
      (await id.getTokenBalance.call(token.address)).toNumber()
    )

    const rec = await id.transferTokens(token.address, accounts[0], 100)
    const accountTokenBalance1 = await token.balanceOf.call(accounts[0])
    // actual gas used 44865
    assert(rec.receipt.gasUsed < 45000, "Too much gas used to transfer tokens")
    assert.deepStrictEqual(accountTokenBalance1.toNumber(), 100)
    assert.deepStrictEqual(
      (await token.balanceOf.call(id.address)).toNumber(),
      0
    )
  })
})
