import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <DynamicContextProvider
    settings={{
      // Find your environment id at https://app.dynamic.xyz/dashboard/developer
      environmentId: "0ca24247-9679-4abc-8963-bb5f36ad358b",
      walletConnectors: [EthereumWalletConnectors],
    }}
  >
    <React.StrictMode>
      <DynamicWidget />

      <App />
    </React.StrictMode>
  </DynamicContextProvider>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();



