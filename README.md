# OdysseyJS - The Odyssey Platform JavaScript Library

## Overview

OdysseyJS is a JavaScript Library for interfacing with the Odyssey Platform. It is built using TypeScript and intended to support both browser and Node.js. The OdysseyJS library allows you to issue commands to the Odyssey node APIs.

The APIs currently supported by default are:

* Admin API
* Auth API
* ALPHA API (A-Chain)
* DELTA API (D-Chain)
* Health API
* Index API
* Info API
* Keystore API
* Metrics API
* OmegaVM API (O-Chain)
* Socket

We built OdysseyJS with ease of use in mind. With this library, any Javascript developer is able to interact with a node on the Odyssey Platform who has enabled their API endpoints for the developer's consumption.

  Using OdysseyJS, developers can:

* Locally manage private keys
* Retrieve balances on addresses
* Get UTXOs for addresses
* Build and sign transactions
* Issue signed transactions to the A-Chain, O-Chain, and D-Chain
* Perform cross-chain swaps between the A-Chain<->O-Chain and between the A-Chain<->D-Chain
* Add Validators and Delegators to the Primary Subnetwork by staking DIONE
* Create a Subnetwork
* Administer a local node
* Retrieve Odyssey network information from a node

### Requirements

OdysseyJS requires Node.js LTS version 14.16.0 or higher to compile.

### Customization

If you're launching a new blockchain and intend to use odysseyjs with it, you should change
some constants. More information can be found [here](./src/utils).

## Installation

### Build from Repository

You can also pull the repo down directly and build it from scratch.

Clone the OdysseyJS repository:

`git clone https://git.sfxdx.com/green-energy1/odysseyjs`

Then build it:

`npm run build`

or

`yarn build`

This will generate a pure JavaScript library and place it in a folder named
"web" in the project root. The "odysseyjs" file can then be dropped into any
project as a pure JavaScript implementation of Odyssey.

## Use OdysseyJS in Projects

The OdysseyJS library can be imported into your existing Node.js project as follows:

```ts
const odyssey = require("odysseyjs")
```

Or into your TypeScript project like this:

```ts
import { Odyssey } from "odysseyjs"
```

## Importing Essentials

```ts
import { Odyssey, BinTools, Buffer, BN } from "odysseyjs"

let bintools = BinTools.getInstance()
```

The above lines import the libraries used in the tutorials. The libraries include:

- odyssey: Our JavaScript module.
- bn.js: A big number module use by OdysseyJS.
- buffer: A Buffer library.
- BinTools: A singleton built into OdysseyJS that is used for dealing with binary data.

## Run Scripts

### TypeScript File

**Via NPM**

Install typescript:

`npm install typescript`

Run the script:

`ts-node script-name.ts`

**Via YARN**

Install typescript:

`yarn add typescript`

Run the script:

`ts-node script-name.ts`

### JavaScript File

As Node.js is already installed per requirements,
simply run the script:

`node script-name.js`

### Example

Let's say that the OdysseyJS repository was cloned. There are a lot of
useful scripts in `Examples`

## Example 1 &mdash; Managing A-Chain Keys

OdysseyJS comes with its own ALPHA Keychain. This KeyChain is used in the functions of the API, enabling them to sign using keys it's registered. The first step in this process is to create an instance of OdysseyJS connected to our Odyssey Platform endpoint of choice.

```js
import { Odyssey, BinTools, Buffer, BN } from "odyssey"

const bintools = BinTools.getInstance()

const myNetworkID = 12345 //default is 1, we want to override that for our local network
const odyssey = new Odyssey("localhost", 9650, "http", myNetworkID)
const achain = odyssey.AChain() //returns a reference to the A-Chain used by OdysseyJS
```

### Accessing the KeyChain

The KeyChain is accessed through the A-Chain and can be referenced directly or through a reference variable.

```js
const myKeychain = achain.keyChain()
```

This exposes the instance of the class ALPHAKeyChain which is created when the A-Chain API is created. At present, this supports secp256k1 curve for ECDSA key pairs.

### Creating A-Chain key pairs

The KeyChain has the ability to create new KeyPairs for you and return the address associated with the key pair.

```js
const newAddress1 = myKeychain.makeKey() // returns an instance of the KeyPair class
```

You may also import your existing private key into the KeyChain using either a Buffer...

```js
const mypk = new Buffer(
  "ab8523913b9963530eb05584dfe85fb63c2516a2b5b7c3aec9d000d716fb1534",
  "hex"
  ) // returns a Buffer
const newAddress2 = myKeychain.importKey(mypk) // returns an instance of the KeyPair class
```

### Working with KeyChains

The A-Chains's KeyChain has standardized key management capabilities. The following functions are available on any KeyChain that implements this interface.

```js
const addresses = myKeychain.getAddresses() // returns an array of Buffers for the addresses
const addressStrings = myKeychain.getAddressStrings() // returns an array of strings for the addresses
const exists = myKeychain.hasKey(addresses[0]) // returns true if the address is managed
const keypair = myKeychain.getKey(addresses[0]) // returns the KeyPair class
```

### Working with KeyPairs

The A-Chain's KeyPair has standardized KeyPair functionality. The following operations are available on any KeyPair that implements this interface.

```js
const address = keypair.getAddress() // returns Buffer
const addressString = keypair.getAddressString() // returns string

const pubk = keypair.getPublicKey() // returns Buffer
const pubkstr = keypair.getPublicKeyString() // returns a CB58 encoded string

const privk = keypair.getPrivateKey() //returns Buffer
const privkstr = keypair.getPrivateKeyString() //returns a CB58 encoded string

keypair.generateKey() // creates a new random KeyPair

const mypk = new Buffer(
  "ab8523913b9963530eb05584dfe85fb63c2516a2b5b7c3aec9d000d716fb1534",
  "hex"
)
const successful = keypair.importKey(mypk) // returns boolean if private key imported successfully

const message = Buffer.from("Through consensus to the stars")
const signature = keypair.sign(message) // returns a Buffer with the signature

const signerPubk = keypair.recover(message, signature) // returns a Buffer
const isValid = keypair.verify(message, signature) // returns a boolean
```

## Example 2 &mdash; Creating An Asset

This example creates an asset in the A-Chain and publishes it to the Odyssey Platform. The first step in this process is to create an instance of OdysseyJS connected to our Odyssey Platform endpoint of choice.

```js
import { Odyssey, BinTools, Buffer, BN } from "odyssey"
import { InitialStates, SECPTransferOutput } from "odyssey/dist/apis/alpha"

const myNetworkID = 12345 // default is 1, we want to override that for our local network
const odyssey = new Odyssey("localhost", 9650, "http", myNetworkID)
const achain = odyssey.AChain() // returns a reference to the A-Chain used by OdysseyJS
```

### Describe the new asset

The first steps in creating a new asset using OdysseyJS is to determine the qualities of the asset. We will give the asset a name, a ticker symbol, as well as a denomination.

```js
// Name our new coin and give it a symbol
const name = "TeamRocket"
const symbol = "ROKT"

// Where is the decimal point indicate what 1 asset is and where fractional assets begin
// Ex: 1 DIONE is denomination 9, so the smallest unit of DIONE is nanoDIONE (nDIONE) at 10^-9 DIONE
const denomination = 9
```

### Creating the initial state

We want to mint an asset with 400 coins to all of our managed keys, 500 to the second address we know of, and 600 to the second and third address. This sets up the state that will result from the Create Asset transaction.

_Note: This example assumes we have the keys already managed in our A-Chain's Keychain._

```js
const addresses = achain.keyChain().getAddresses()

// Create outputs for the asset's initial state
const secpOutput1 = new SECPTransferOutput(
  new BN(400),
  new BN(400),
  1,
  addresses
)
const secpOutput2 = new SECPTransferOutput(new BN(500), new BN(400), 1, [
  addresses[1],
])
const secpOutput3 = new SECPTransferOutput(new BN(600), new BN(400), 1, [
  addresses[1],
  addresses[2],
])

// Populate the initialStates with the outputs
const initialState = new InitialStates()
initialState.addOutput(secpOutput1)
initialState.addOutput(secpOutput2)
initialState.addOutput(secpOutput3)
```

### Creating the signed transaction

Now that we know what we want an asset to look like, we create an output to send to the network. There is an ALPHA helper function `buildCreateAssetTx()` which does just that.

```js
// Fetch the UTXOSet for our addresses
const utxos = await achain.getUTXOs(addresses)

// Make an unsigned Create Asset transaction from the data compiled earlier
const unsigned = await achain.buildCreateAssetTx(
  utxos, // the UTXOSet containing the UTXOs we're going to spend
  addresses, // the addresses which will pay the fees
  addresses, // the addresses which recieve the change from the spent UTXOs
  initialState, // the initial state to be created for this new asset
  name, // the full name of the asset
  symbol, // a short ticker symbol for the asset
  denomination // the asse's denomination
)

const signed = unsigned.sign(achain) // returns a Tx class
```

### Issue the signed transaction

Now that we have a signed transaction ready to send to the network, let's issue it!

Using the OdysseyJS A-Chain API, we going to call the `issueTx` function. This function can take either the Tx class returned in the previous step, a CB58 representation of the transaction, or a raw Buffer class with the data for the transaction. Examples of each are below:

```js
// using the Tx class
const txid = await achain.issueTx(signed) // returns a CB58 serialized string for the TxID
```

```js
// using the base-58 representation
const txid = await achain.issueTx(signed.toString()) // returns a CB58 serialized string for the TxID
```

```js
// using the transaction Buffer
const txid = await achain.issueTx(signed.toBuffer()) // returns a CB58 serialized string for the TxID
```

We assume ONE of those methods are used to issue the transaction.

### Get the status of the transaction

Now that we sent the transaction to the network, it takes a few seconds to determine if the transaction has gone through. We can get an updated status on the transaction using the TxID through the ALPHA API.

```js
// returns one of: "Accepted", "Processing", "Unknown", and "Rejected"
const status = await achain.getTxStatus(txid)
```

The statuses can be one of "Accepted", "Processing", "Unknown", and "Rejected":

* "Accepted" indicates that the transaction has been accepted as valid by the network and executed
* "Processing" indicates that the transaction is being voted on.
* "Unknown" indicates that node knows nothing about the transaction, indicating the node doesn't have it
* "Rejected" indicates the node knows about the transaction, but it conflicted with an accepted transaction

### Identifying the newly created asset

The A-Chain uses the TxID of the transaction which created the asset as the unique identifier for the asset. This unique identifier is henceforth known as the "AssetID" of the asset. When assets are traded around the A-Chain, they always reference the AssetID that they represent.

## Example 3 &mdash; Sending An Asset

This example sends an asset in the A-Chain to a single recipient. The first step in this process is to create an instance of Odyssey connected to our Odyssey Platform endpoint of choice.

```js
import { Odyssey, BinTools, Buffer, BN } from "odyssey"

const myNetworkID = 12345 // default is 1, we want to override that for our local network
const odyssey = new odyssey.Odyssey(
  "localhost",
  9650,
  "http",
  myNetworkID
)
const achain = odyssey.AChain() // returns a reference to the A-Chain used by OdysseyJS
```

We're also assuming that the keystore contains a list of addresses used in this transaction.

### Getting the UTXO Set

The A-Chain stores all available balances in a datastore called Unspent Transaction Outputs (UTXOs). A UTXO Set is the unique list of outputs produced by transactions, addresses that can spend those outputs, and other variables such as lockout times (a timestamp after which the output can be spent) and thresholds (how many signers are required to spend the output).

For the case of this example, we're going to create a simple transaction that spends an amount of available coins and sends it to a single address without any restrictions. The management of the UTXOs will mostly be abstracted away.

However, we do need to get the UTXO Set for the addresses we're managing.

```js
const myAddresses = achain.keyChain().getAddresses() // returns an array of addresses the KeyChain manages as buffers
const addressStrings = achain.keyChain().getAddressStrings() // returns an array of addresses the KeyChain manages as strings
const u = await achain.getUTXOs(myAddresses)
const utxos = u.utxos
```

### Spending the UTXOs

The `buildBaseTx()` helper function sends a single asset type. We have a particular assetID whose coins we want to send to a recipient address. This is an imaginary asset for this example which we believe to have 400 coins. Let's verify that we have the funds available for the transaction.

```js
const assetID = "8pfG5CTyL5KBVaKrEnCvNJR95dUWAKc1hrffcVxfgi8qGhqjm" // cb58 string
const mybalance = utxos.getBalance(myAddresses, assetID) // returns 400 as a BN
```

We have 400 coins! We're going to now send 100 of those coins to our friend's address.

```js
const sendAmount = new BN(100) // amounts are in BN format
const friendsAddress = "A-dione1k26jvfdzyukms95puxcceyzsa3lzwf5fzew454" // address format is Bech32

// The below returns a UnsignedTx
// Parameters sent are (in order of appearance):
//   * The UTXO Set
//   * The amount being sent as a BN
//   * An array of addresses to send the funds
//   * An array of addresses sending the funds
//   * An array of addresses any leftover funds are sent
//   * The AssetID of the funds being sent
const unsignedTx = await achain.buildBaseTx(
  utxos,
  sendAmount,
  [friendsAddress],
  addressStrings,
  addressStrings,
  assetID
)
const signedTx = achain.signTx(unsignedTx)
const txid = await achain.issueTx(signedTx)
```

And the transaction is sent!

### Get the status of the transaction

Now that we sent the transaction to the network, it takes a few seconds to determine if the transaction has gone through. We can get an updated status on the transaction using the TxID through the A-Chain.

```js
// returns one of: "Accepted", "Processing", "Unknown", and "Rejected"
const status = await achain.getTxStatus(txid)
```

The statuses can be one of "Accepted", "Processing", "Unknown", and "Rejected":

* "Accepted" indicates that the transaction has been accepted as valid by the network and executed
* "Processing" indicates that the transaction is being voted on.
* "Unknown" indicates that node knows nothing about the transaction, indicating the node doesn't have it
* "Rejected" indicates the node knows about the transaction, but it conflicted with an accepted transaction

### Check the results

The transaction finally came back as "Accepted", now let's update the UTXOSet and verify that the transaction balance is as we expected.

*Note: In a real network the balance isn't guaranteed to match this scenario. Transaction fees or additional spends may vary the balance. For the purpose of this example, we assume neither of those cases.*

```js
const updatedU = await achain.getUTXOs()
const updatedUTXOs = updatedU.utxos
const newBalance = updatedUTXOs.getBalance(myAddresses, assetID)
if (newBalance.toNumber() != mybalance.sub(sendAmount).toNumber()) {
  throw Error("heyyy these should equal!")
}
```
