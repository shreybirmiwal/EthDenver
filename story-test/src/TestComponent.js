import { custom, stringToHex } from 'viem';
import { useWalletClient } from "wagmi";
import { StoryClient } from "@story-protocol/core-sdk";

export default function TestComponent() {
    const { data: wallet } = useWalletClient();

    async function setupStoryClient() {
        if (!wallet) {
            throw new Error("Wallet not connected");
        }

        return StoryClient.newClient({
            account: wallet.account,
            transport: custom(wallet.transport),
            chainId: 1, // Replace with your actual chain ID
        });
    }

    async function registerIp() {
        try {
            const client = await setupStoryClient();
            const response = await client.ipAsset.register({
                nftContract: '0x5946aeAAB44e65Eb370FFaa6a7EF2218Cff9b47D',
                tokenId: '1',
                ipMetadata: {
                    ipMetadataURI: "test-metadata-uri",
                    ipMetadataHash: stringToHex("test-metadata-hash", { size: 32 }),
                    nftMetadataURI: "test-nft-metadata-uri",
                    nftMetadataHash: stringToHex("test-nft-metadata-hash", { size: 32 }),
                },
                txOptions: { waitForTransaction: true },
            });
            console.log(`Transaction hash: ${response.txHash}, IPA ID: ${response.ipId}`);
        } catch (error) {
            console.error("Error registering IP:", error);
        }
    }

    return (
        <div>
            <button
                onClick={registerIp}
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
                {wallet ? "Register IP" : "Connect Wallet First"}
            </button>
        </div>
    )
}