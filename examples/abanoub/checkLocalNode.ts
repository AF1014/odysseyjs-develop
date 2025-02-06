import "dotenv/config"
import { Odyssey } from "../../src"
import { InfoAPI } from "../../src/apis/info"

const ip = process.env.LOCAL_IP
const port = Number(process.env.LOCAL_PORT)
const protocol = process.env.LOCAL_PROTOCOL
const networkID = Number(process.env.LOCAL_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const info: InfoAPI = odyssey.Info()

const main = async (): Promise<any> => {
  const achain = await info.isBootstrapped("A")
  const dchain = await info.isBootstrapped("D")
  const ochain = await info.isBootstrapped("O")

  console.log(`Bootstraped? A(${achain}), D(${dchain}), O(${ochain})`)
}

main()