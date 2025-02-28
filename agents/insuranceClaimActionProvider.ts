import { z } from "zod";
import { encodeFunctionData } from "viem"; // If you're using viem for encoding
import { ActionProvider } from "../actionProvider";
import { EvmWalletProvider } from "../../wallet-providers";
import { CreateAction } from "../actionDecorator";
import { Network } from "../../network";

/**
 * ABI snippet for the InsuranceClaims contract, focusing on fileClaim.
 * If you want to interact with more functions (approveClaim, etc.),
 * add their definitions here as well.
 */
const INSURANCE_CLAIMS_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "imageReference",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "estimatedDamage",
        "type": "uint256"
      }
    ],
    "name": "fileClaim",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "claimId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
];

/**
 * Define a Zod schema to validate inputs for filing an insurance claim.
 * Adjust types as needed (e.g., if you want "estimatedDamage" as a string or number).
 */
const FileClaimSchema = z.object({
  contractAddress: z.string().min(1, "Contract address is required"),
  imageReference: z.string().min(1, "Image reference is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  estimatedDamage: z.string().min(1, "Estimated damage is required"),
});

/**
 * InsuranceClaimActionProvider is an action provider for calling
 * the InsuranceClaims contract on an EVM network (e.g., Sepolia).
 */
export class InsuranceClaimActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    // The second argument ([]) is an array of dependencies or sub-actions if needed.
    super("insuranceClaim", []);
  }

  /**
   * The agent uses this method to check if the provider supports the current network.
   * Update the condition if you want to support multiple networks.
   */
  supportsNetwork = (network: Network) =>
    network.protocolFamily === "evm" && network.networkId === "sepolia";

  /**
   * fileClaim action that sends a transaction to the InsuranceClaims contract's fileClaim function.
   */
  @CreateAction({
    name: "fileClaim",
    description: `
Calls the 'fileClaim' function on an InsuranceClaims contract to file a new claim.
Requires:
- contractAddress: The deployed InsuranceClaims contract address
- imageReference: IPFS hash or URL for the crash image
- location: The location where the incident occurred
- description: A short description of the incident
- estimatedDamage: Estimated damage as a numeric string (in smallest currency units)
    `,
    schema: FileClaimSchema,
  })
  async fileClaim(wallet: EvmWalletProvider, args: z.infer<typeof FileClaimSchema>): Promise<string> {
    try {
      // Convert the estimated damage to a BigInt
      const estimatedDamage = BigInt(args.estimatedDamage);

      // Encode the function call using viem
      const data = encodeFunctionData({
        abi: INSURANCE_CLAIMS_ABI,
        functionName: "fileClaim",
        args: [
          args.imageReference,
          args.location,
          args.description,
          estimatedDamage,
        ],
      });

      // Send the transaction
      const txHash = await wallet.sendTransaction({
        to: args.contractAddress as `0x${string}`,
        data,
        value: 0n, // no ETH needed
      });

      // Wait for receipt
      const receipt = await wallet.waitForTransactionReceipt(txHash);

      if (!receipt) {
        throw new Error("No receipt received for fileClaim transaction");
      }

      if (receipt.status !== "success") {
        throw new Error(`fileClaim transaction failed with status ${receipt.status}`);
      }

      return `Insurance claim filed successfully with transaction hash: ${txHash}\nTransaction receipt: ${JSON.stringify(
        receipt,
        (_, value) => (typeof value === "bigint" ? value.toString() : value),
        2
      )}`;
    } catch (error) {
      console.error("Error filing insurance claim:", error);
      if (error instanceof Error) {
        return `Error filing insurance claim: ${error.message}`;
      }
      return `Error filing insurance claim: ${error}`;
    }
  }
}

/**
 * Export a function to instantiate the provider.
 * This can be imported and registered in your agent's index or wherever you load providers.
 */
export const insuranceClaimActionProvider = () => new InsuranceClaimActionProvider();
