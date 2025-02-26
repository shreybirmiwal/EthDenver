// src/components/Web3Providers.tsx
import React, { PropsWithChildren } from "react";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { aeneid } from "@story-protocol/core-sdk";

const config = createConfig({
  chains: [aeneid],
  multiInjectedProviderDiscovery: false,
  transports: {
    [aeneid.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Web3Providers({ children }: PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.REACT_APP_DYNAMIC_ENV_ID as string,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            {children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
