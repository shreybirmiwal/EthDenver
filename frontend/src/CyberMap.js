import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './home.css';
import { ToastContainer, toast } from 'react-toastify';



import { custom, stringToHex } from 'viem';
import { useWalletClient } from "wagmi";
import { StoryClient, PIL_TYPE } from "@story-protocol/core-sdk";
import { LicenseTerms } from '@story-protocol/core-sdk';
import { zeroAddress, zeroHash } from 'viem'

import {
    DynamicContextProvider,
    DynamicWidget,
} from '@dynamic-labs/sdk-react-core';
import {
    createConfig,
    WagmiProvider,
    useAccount,
} from 'wagmi';
import { QueryClient, QueryClientProvider, infiniteQueryOptions } from '@tanstack/react-query';


import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import * as dagPB from '@ipld/dag-pb'



const createDotIcon = () => {
    return new L.DivIcon({
        className: 'green-dot-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });
};

const DarkTileLayer = () => (
    <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution=''
    />
);

const CyberMap = ({ allCams, query_found_cam, query_found_res }) => {

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



    async function PayRoyalty(receiverIpId) {
        console.log("Paying royalty to reciever IP ID", receiverIpId);

        toast.info('Paying royalty to reciever IP:' + receiverIpId, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });


        try {
            const client = await setupStoryClient();

            const payRoyalty = await client.royalty.payRoyaltyOnBehalf({
                receiverIpId: receiverIpId,
                payerIpId: zeroAddress,
                token: '0x1514000000000000000000000000000000000000',
                amount: 2,
                txOptions: { waitForTransaction: true },
            });


            console.log(`Paid royalty at transaction hash ${payRoyalty.txHash}`);

            toast.success(`Royalty paid successfully: tx: ${payRoyalty.txHash}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });

        } catch (error) {
            console.error("Error registering IP with royalties:", error);
        }
    }


    async function convertToCIDv0(content) {
        const bytes = dagPB.encode({
            Data: new TextEncoder().encode(JSON.stringify(content)),
            Links: []
        })

        const hash = await sha256.digest(bytes)
        return CID.createV0(hash).toString()
    }
    async function disputeIP(targetIpId, metadataContent) { // Pass metadata instead of CID
        try {

            const client = await setupStoryClient()



            console.log("Disputing IP ID", targetIpId);

            toast.info('Disputing IP ID:' + targetIpId, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });

            // Convert metadata to CIDv0
            const disputeCID = await convertToCIDv0(metadataContent)

            const disputeResponse = await client.dispute.raiseDispute({
                targetIpId: targetIpId,
                cid: disputeCID, // Use converted CIDv0
                targetTag: 'IMPROPER_REGISTRATION',
                bond: 0,
                liveness: 2592000,
                txOptions: { waitForTransaction: true },
            })
            console.log(`Dispute raised: ${disputeResponse.txHash}`)
            console.log(`Dispute raised at transaction hash ${disputeResponse.txHash}, Dispute ID: ${disputeResponse.disputeId}`)

            toast.success(`Dispute raised successfully: tx: ${disputeResponse.txHash}, Dispute ID: ${disputeResponse.disputeId}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } catch (error) {
            console.error("Error disputing IP:", error)
        }
    }

    // async function disputeIP(targetIpId, cid) {

    //     console.log("Disputing IP ID", targetIpId);

    //     toast.info('Disputing IP ID:' + targetIpId, {
    //         position: "top-right",
    //         autoClose: 5000,
    //         hideProgressBar: false,
    //         closeOnClick: false,
    //         pauseOnHover: true,
    //         draggable: true,
    //         progress: undefined,
    //         theme: "dark",
    //     });

    //     try {
    //         const client = await setupStoryClient();

    //         const disputeResponse = await client.dispute.raiseDispute({
    //             targetIpId: targetIpId,
    //             // NOTE: you must use your own CID here, because every time it is used,
    //             // the protocol does not allow you to use it again
    //             cid: cid,
    //             // you must pick from one of the whitelisted tags here: 
    //             // https://docs.story.foundation/docs/dispute-module#dispute-tags
    //             targetTag: 'IMPROPER_REGISTRATION',
    //             bond: 0,
    //             liveness: 2592000,
    //             txOptions: { waitForTransaction: true },
    //         })
    //         console.log(`Dispute raised at transaction hash ${disputeResponse.txHash}, Dispute ID: ${disputeResponse.disputeId}`)

    //         toast.success(`Dispute raised successfully: tx: ${disputeResponse.txHash}, Dispute ID: ${disputeResponse.disputeId}`, {
    //             position: "top-right",
    //             autoClose: 5000,
    //             hideProgressBar: false,
    //             closeOnClick: false,
    //             pauseOnHover: true,
    //             draggable: true,
    //             progress: undefined,
    //             theme: "dark",
    //         });
    //     }
    //     catch (error) {
    //         console.error("Error disputing IP:", error);
    //     }
    // }


    const [view, setView] = useState({
        center: [40.7128, -74.0060],
        zoom: 6
    });
    const [selectedCam, setSelectedCam] = useState(null);
    const [autoOpenDone, setAutoOpenDone] = useState(false);

    const defaultIcon = createDotIcon();

    function ChangeView({ center, zoom }) {
        const map = useMap();
        useEffect(() => {
            map.flyTo(center, zoom, { duration: 1 });
        }, [center, zoom, map]);
        return null;
    }

    const callAgent = async (cam, wallet_addy) => {

        const response = await fetch('/api/callAgent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "cam": cam, "wallet_addy": wallet_addy })
        });

        const data = await response.json();

        console.log("call agent returned data ", data)

    }

    useEffect(() => {
        if (query_found_cam?.location && !autoOpenDone) {
            try {
                const [lat, lng] = query_found_cam.location.split(',').map(Number);

                // Set proper coordinates and higher zoom
                setView({
                    center: [lat, lng],
                    zoom: 10 // Closer zoom level
                });
                setSelectedCam(query_found_cam);
                setAutoOpenDone(true);

            } catch (e) {
                console.error('Invalid query camera coordinates:', e);
            }
        }
    }, [query_found_cam, autoOpenDone]);



    const CentralPopup = () => {
        const [refreshTimestamp, setRefreshTimestamp] = useState(Date.now());

        if (!selectedCam) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center z-[1000] pointer-events-none" onClick={() => setSelectedCam(null)}>


                <div className="bg-black border-2 border-green-500 w-3/4 h-3/4 flex relative pointer-events-auto p-2">
                    {/* Refresh Button */}
                    <button
                        className="absolute top-2 left-2 text-green-500 hover:text-green-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            setRefreshTimestamp(Date.now());
                        }}
                        title="Refresh Stream"
                    >
                        ↻
                    </button>

                    {/* Close Button */}
                    <button
                        className="absolute top-2 right-2 text-green-500 hover:text-green-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCam(null);
                        }}
                    >
                        X
                    </button>

                    <div className="w-1/2 border-r-2 border-green-500 p-4">
                        <img
                            src={`${selectedCam.image_url}`}
                            alt="Camera feed"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="w-1/2 p-4 font-mono text-green-500">
                        <div className="terminal-text">
                            > INITIALIZING SURVEILLANCE MODULE...
                            <br />
                            > SYSTEM TIME: {new Date().toLocaleTimeString()}
                            <br />
                            > CAMERA ID: {selectedCam.uid}

                        </div>

                        {selectedCam.uid === query_found_cam?.uid &&
                            <div className="terminal-text">
                                
                                > QUERY RESULT:
                                <br /> <br />
                                {query_found_res}

                            </div>

                        }

                        <div className="terminal-text border-t-2 border-green-500 pt-2" onClick={() => PayRoyalty(selectedCam.ipId)}>
                            > PAY ROYALTY
                        </div>

                        <div className="terminal-text border-t-2 border-red-500 pt-2" onClick={() => disputeIP(selectedCam.ipId, selectedCam.CID)}>
                            > DISPUTE (this is my camera!)
                        </div>

                        <div className="terminal-text border-t-2 border-green-500 pt-2" onClick={() => callAgent(selectedCam, wallet.account)}>
                            > INSURANCE AGENT
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen w-full cyber-map-container">
            <DynamicWidget />

            <MapContainer
                center={view.center}
                zoom={view.zoom}
                style={{ height: '100%', width: '100%' }}
                attributionControl={false}
            >
                <ChangeView center={view.center} zoom={view.zoom} />
                <DarkTileLayer />
                {allCams.map((cam) => {
                    try {
                        const [lat, lng] = cam.location?.split(',').map(Number);
                        if (isNaN(lat) || isNaN(lng)) return null;

                        return (
                            <Marker
                                key={cam.id}
                                position={[lat, lng]}
                                icon={defaultIcon}
                                eventHandlers={{
                                    click: () => {
                                        setSelectedCam(cam);
                                    }
                                }}
                            />
                        );
                    } catch (e) {
                        console.error('Invalid camera coordinates:', cam.location);
                        return null;
                    }
                })}
            </MapContainer>
            <CentralPopup />

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </div>
    );
};

export default CyberMap;