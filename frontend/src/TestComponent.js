import { custom, stringToHex } from 'viem';
import { useWalletClient } from "wagmi";
import { StoryClient, PIL_TYPE } from "@story-protocol/core-sdk";
import { LicenseTerms } from '@story-protocol/core-sdk';


export default function TestComponent() {
    const { data: wallet } = useWalletClient();

    async function setupStoryClient() {
        if (!wallet) {
            throw new Error("Wallet not connected");
        }
        return StoryClient.newClient({
            account: wallet.account,
            transport: custom(wallet.transport),
            chainId: "aeneid", // Replace with your actual chain ID
        });
    }

    async function registerIpWithRoyalties() {
        try {
            const client = await setupStoryClient();

            // PIL Terms configuration for royalties
            const commercialRemixTerms = {
                transferable: true,
                royaltyPolicy: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E', // RoyaltyPolicyLAP address from https://docs.story.foundation/docs/deployed-smart-contracts
                //  defaultMintingFee: BigInt(0),
                // expiration: BigInt(0),
                commercialUse: true,
                commercialAttribution: true,
                //   commercializerChecker: zeroAddress,
                //  commercializerCheckerData: zeroAddress,
                commercialRevShare: 50, // can claim 50% of derivative revenue
                //commercialRevCeiling: BigInt(0),
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesApproval: false,
                derivativesReciprocal: true,
                //derivativeRevCeiling: BigInt(0),
                currency: '0x1514000000000000000000000000000000000000', // $WIP address from https://docs.story.foundation/docs/deployed-smart-contracts
                uri: '',
            }
            const licensingConfig = {
                isSet: false,
                //mintingFee: BigInt(0),
                //  licensingHook: zeroAddress,
                // hookData: zeroHash,
                commercialRevShare: 0,
                disabled: false,
                expectMinimumGroupRewardShare: 0,
                //expectGroupRewardPool: zeroAddress,
            };

            const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
                spgNftContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc',
                licenseTermsData: [{ terms: commercialRemixTerms, licensingConfig }], // IP already has non-commercial social remixing terms. You can add more here.
                // set to true to mint ip with same nft metadata
                allowDuplicates: true,
                // https://docs.story.foundation/docs/ip-asset#adding-nft--ip-metadata-to-ip-asset
                ipMetadata: {
                    ipMetadataURI: 'test-uri',
                    ipMetadataHash: stringToHex('test-metadata-hash', { size: 32 }),
                    nftMetadataHash: stringToHex('test-nft-metadata-hash', { size: 32 }),
                    nftMetadataURI: 'test-nft-uri',
                },
                txOptions: { waitForTransaction: true },
            })


            console.log(`Transaction hash: ${response.txHash}, 
                   Token ID: ${response.tokenId}, 
                   IPA ID: ${response.ipId}`);
        } catch (error) {
            console.error("Error registering IP with royalties:", error);
        }
    }

    return (
        <div>
            <button
                onClick={registerIpWithRoyalties}
                disabled={!wallet}
                style={{
                    padding: '10px 20px',
                    backgroundColor: wallet ? '#4CAF50' : '#cccccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: wallet ? 'pointer' : 'not-allowed'
                }}
            >
                {wallet ? "Mint IP with Royalties" : "Connect Wallet First"}
            </button>
        </div>
    )
}