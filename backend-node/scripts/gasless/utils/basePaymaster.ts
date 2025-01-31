import { DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/modules";
import { resolveProperties } from "ethers/lib/utils";
import { ethers } from "ethers";
import { UserOperation } from "@biconomy/core-types";

  function correctHexString(payloadValue: string): string {
    if(payloadValue.indexOf('0x0') > -1 && payloadValue.length > 3) payloadValue = payloadValue.replace('0x0','0x')
    return payloadValue
  }

  // Define the PaymasterDataMiddlewareOverrideFunction
  export const getBasePaymasterAndData = async (uoStruct: Partial<UserOperation>, chainId: number) => {
    // Return at minimum {paymasterAndData: "0x..."}, can also return gas estimates
    console.log("final paymaster", uoStruct);

    const params1: any = await resolveProperties(uoStruct);
    console.log("params1", params1);
    const body = {
      id: 1,
      jsonrpc: "2.0",
      method: "eth_paymasterAndDataForUserOperation",
      params: [
        {
          ...params1,
          nonce: correctHexString(ethers.BigNumber.from(params1.nonce).toHexString()),
          sender: uoStruct.sender,
          callGasLimit: correctHexString(ethers.BigNumber.from(params1.callGasLimit).toHexString()),
          preVerificationGas: correctHexString(ethers.BigNumber.from(params1.preVerificationGas).toHexString()),
          verificationGasLimit: correctHexString(ethers.BigNumber.from(params1.verificationGasLimit).toHexString()),
          maxFeePerGas: correctHexString(ethers.BigNumber.from(params1.maxFeePerGas).toHexString()),
          maxPriorityFeePerGas: correctHexString(ethers.BigNumber.from(params1.maxPriorityFeePerGas).toHexString()),
        },
        DEFAULT_ENTRYPOINT_ADDRESS,
        correctHexString(ethers.BigNumber.from(chainId).toHexString()),
      ],
    };

    console.log("body", body);

    const response = await fetch("https://paymaster.base.org", {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();

    console.log("response", data);

    return {
      paymasterAndData: data.result,
    };
  };