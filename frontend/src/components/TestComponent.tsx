// src/components/TestComponent.tsx
import React from "react";
import { custom, toHex } from "viem";
import { useWalletClient } from "wagmi";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

export default function TestComponent() {
  const { data: wallet } = useWalletClient();

  async function setupStoryClient(): Promise<StoryClient> {
    const config: StoryConfig = {
      account: wallet!.account,
      transport: custom(wallet!.transport),
      chainId: "aeneid",
    };
    return StoryClient.newClient(config);
  }

  async function registerIp() {
    const client = await setupStoryClient();
    const response = await client.ipAsset.register({
      nftContract: "0x01...",
      tokenId: "1",
      ipMetadata: {
        ipMetadataURI: "test-metadata-uri",
        ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
        nftMetadataURI: "test-nft-metadata-uri",
        nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
      },
      txOptions: { waitForTransaction: true },
    });
    console.log(
      `Root IPA created at tx hash ${response.txHash}, IPA ID: ${response.ipId}`
    );
  }

  return (
    <div>
      <button onClick={registerIp}>Register IP Asset</button>
    </div>
  );
}
