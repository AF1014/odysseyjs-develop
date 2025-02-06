import "dotenv/config"
import { Odyssey, Buffer } from "../../src"
import { DELTAAPI } from "../../src/apis/delta"
import { Web3 } from "web3"

const ip = process.env.LOCAL_IP
const port = Number(process.env.LOCAL_PORT)
const protocol = process.env.LOCAL_PROTOCOL
const networkID = Number(process.env.LOCAL_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const key = process.env.PRIVATE_KEY1 ?? ""
const dHexAddress = process.env.PUBLIC_KEY1 ?? ""
const path: string = "/ext/bc/D/rpc"
const web3 = new Web3(`${protocol}://${ip}:${port}${path}`)
const privKey: Buffer = new Buffer(key, "hex")
const dchain: DELTAAPI = odyssey.DChain()
const dKeychain = dchain.keyChain()

dKeychain.importKey(privKey)

const main = async (): Promise<any> => {
  const toAddress = process.env.PUBLIC_KEY2 ?? ""
  const nonce = await web3.eth.getTransactionCount(dHexAddress)
  const tx = {
    from: dHexAddress,
    to: toAddress,
    value: web3.utils.toWei("234", "ether"),
    gas: 21000,
    gasPrice: await web3.eth.getGasPrice(),
    nonce
  }

  const dbalance = await web3.eth.getBalance(dHexAddress)
  console.log(`Balance(${dbalance.toString()})`)

  const signedTx = await web3.eth.accounts.signTransaction(tx, `0x${key}`)
  if (signedTx) {
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    console.log("tx id:", receipt.transactionHash)
  }
  else {
    console.error("failed to sign tx")
  }
}

main()