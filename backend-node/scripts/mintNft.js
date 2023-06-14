const { ethers } = require("ethers");
const { createBiconomyAccountInstance, buildAndSendUserOp, sendUserOp } = require('./helperFunctionsBvpm')
const { BiconomyVerifyingPaymaster } = require("@biconomy/paymaster")
const config = require("../config.json");

const mintNft = async () => {
  const biconomySmartAccount = await createBiconomyAccountInstance()

  const nftInterface = new ethers.utils.Interface([
    'function safeMint(address _to)'
  ])
  const data = nftInterface.encodeFunctionData(
    'safeMint', [biconomySmartAccount.address]
  )
  const nftAddress = "0xdd526eba63ef200ed95f0f0fb8993fe3e20a23d0" // same for goerli and mumbai
  const transaction = {
    to: nftAddress,
    data: data,
  }

  const verifyingPaymaster =  new BiconomyVerifyingPaymaster({
    paymasterUrl: config.verifyingPaymasterUrl,
  })

  console.log('verifying paymaster ', verifyingPaymaster)

  console.log('biconomySmartAccount.paymaster ', biconomySmartAccount.paymaster)


  let partialUserOp = await biconomySmartAccount.buildUserOp([transaction])

  const paymasterServiceData = {
    "webhookData": {},
    "smartAccountTypeVersionData": {
      "name": "BICONOMY",
      "version": "1.0.0"
    }
  }

  console.log('partialUserOp is ')
  console.log(partialUserOp)

  const paymasterData = await verifyingPaymaster?.getPaymasterAndData(partialUserOp, paymasterServiceData);
  console.log('successfull call return: paymasterAndData ', paymasterData)

  partialUserOp.paymasterAndData = paymasterData

  // Sending transaction
  const userOpResponse = await biconomySmartAccount.sendUserOp(partialUserOp)
  console.log('userOpResponse ', userOpResponse)
}

module.exports = { mintNft };