import "dotenv/config"
import { Odyssey } from "../../src"
import { ALPHAAPI } from "../../src/apis/alpha"

const ip = process.env.IP
const port = Number(process.env.PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()

const main = async (): Promise<any> => {
  const address: string = "A-testnet1r86v49tyxa05zpfwa3pj896mv0w5mdtcdzxx34"
  const balance: object = await achain.getBalance(address, "DIONE")
  console.log(balance)
}

main()
