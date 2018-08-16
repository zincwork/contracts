import { assert } from "chai"

/*tslint:disable-next-line:no-var-requires*/
const ethSigUtil = require("eth-sig-util")
const header1 = "string message"
const header2 = "uint32 nonce"
const privateKey =
  "7590B571C1F46A962F8507C162937E7B6AE934ED2CEA9AEE1F05691793DACA3C"
const publicKey = "0x3D158a6D12d82B925E264217f834c8C9EdC5F3D5"
const keyToAdd = "0x91f04cfa7c6c26cb080cc00e100403ca3bb86211"
const eventSha = web3.sha3("UserIdentityCreated(address,address)")

function createSignedMessage(key: string, nonce: number, message: string) {
  if (key.startsWith("0x")) {
    key = key.substr(2)
  }
  const data = [
    {
      type: "string",
      name: "message",
      value: message
    },
    {
      type: "uint32",
      name: "nonce",
      value: nonce
    }
  ]

  return {
    data,
    sig: ethSigUtil.signTypedData(Buffer.from(key, "hex"), { data })
  }
}

const ZincAcessor = artifacts.require("ZincAccessor")
const Identity = artifacts.require("Identity")

contract("ZincAccessor", (accounts) => {
  it("should construct ZincAccessor and make a user Identity", async () => {
    const zinc = await ZincAcessor.new()
    const userAddress = "0x45896ebf214e6691bf83c1da386604d3a4e690b1"
    const receipt: any = await zinc.constructUserIdentity(
      userAddress,
      "Hi, user! Please sign this message so that we can verify you have the private key to this address",
      2,
      header1,
      header2,
      "0x4d635a8daac62936e6c91a4c08bfe38cc03bb24533965db62f21301e18fc40e7",
      "0x0b4181429e289f8bb0e891bde0020487d82709fba61bc21367b0d8890ddf702b",
      28
    )

    // actual gas used 667173
    assert(
      receipt.receipt.gasUsed < 670000,
      "Too much gas used for constructUserIdentity"
    )

    let idContractAddress

    if (
      receipt.receipt.status &&
      receipt.receipt.transactionHash &&
      receipt.receipt.logs
    ) {
      for (const log of receipt.receipt.logs) {
        if (log.topics[0] === eventSha) {
          idContractAddress = `0x${log.topics[2].slice(-40)}`
          break
        }
      }
      const id = Identity.at(idContractAddress)

      const userPrivileges = await id.getAccessorPurpose(userAddress)
      assert.deepStrictEqual(userPrivileges.toNumber(), 15)

      const zincPrivileges = await id.getAccessorPurpose(zinc.address)
      assert.deepStrictEqual(zincPrivileges.toNumber(), 4)
    }
  })

  it("can add accessor with a valid purpose", async () => {
    const purpose = 3

    const zinc = await ZincAcessor.new()
    const id = await Identity.new([zinc.address, publicKey], [4, 15])

    const message1 = `Add ${keyToAdd} to ${id.address} with purpose ${purpose}`

    let { sig } = createSignedMessage(privateKey, 1, message1)

    sig = sig.substr(2) // remove 0x
    const r = "0x" + sig.slice(0, 64)
    const s = "0x" + sig.slice(64, 128)
    const v = "0x" + sig.slice(128, 130)
    const vDecimal = web3.toDecimal(v)

    const receipt: any = await zinc.addAccessor(
      keyToAdd,
      id.address,
      purpose,
      publicKey,
      message1,
      1, // nonce
      header1,
      header2,
      r,
      s,
      vDecimal
    )

    // actual gas used 163189
    assert(
      receipt.receipt.gasUsed < 164000,
      "Too much gas used to add accessor"
    )

    const purposeShouldBe = await id.getAccessorPurpose(keyToAdd)

    assert.deepStrictEqual(purposeShouldBe.toNumber(), purpose)
  })

  it("can add and remove accessor with a valid purpose", async () => {
    const purpose = 3
    let nonce = 1

    const zinc = await ZincAcessor.new()
    const id = await Identity.new([zinc.address, publicKey], [4, 15])

    let message1 = `Add ${keyToAdd} to ${id.address} with purpose ${purpose}`

    let { sig } = createSignedMessage(privateKey, nonce, message1)

    sig = sig.substr(2) // remove 0x
    let r = "0x" + sig.slice(0, 64)
    let s = "0x" + sig.slice(64, 128)
    let v = "0x" + sig.slice(128, 130)
    let vDecimal = web3.toDecimal(v)

    await zinc.addAccessor(
      keyToAdd,
      id.address,
      purpose,
      publicKey,
      message1,
      nonce,
      header1,
      header2,
      r,
      s,
      vDecimal
    )
    const purposeShouldBe = await id.getAccessorPurpose(keyToAdd)

    assert.deepStrictEqual(purposeShouldBe.toNumber(), purpose)

    // Code for removeAccessor begins here:

    ++nonce
    message1 = `Remove ${keyToAdd} from ${id.address}`

    sig = createSignedMessage(privateKey, nonce, message1).sig

    sig = sig.substr(2) // remove 0x
    r = "0x" + sig.slice(0, 64)
    s = "0x" + sig.slice(64, 128)
    v = "0x" + sig.slice(128, 130)
    vDecimal = web3.toDecimal(v)

    const receipt: any = await zinc.removeAccessor(
      keyToAdd,
      id.address,
      publicKey,
      message1,
      nonce,
      header1,
      header2,
      r,
      s,
      vDecimal
    )

    // actual gas used 118892
    assert(
      receipt.receipt.gasUsed < 120000,
      "Too much gas used for removing accessor"
    )

    assert.deepStrictEqual(
      (await id.getAccessorPurpose(keyToAdd)).toNumber(),
      0
    )
  })
})
