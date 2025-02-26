import { SPGNFTContractAddress, client } from './utils/utils'
import { uploadJSONToIPFS } from './utils/uploadToIpfs'
import { createHash } from 'crypto'
import fetch from 'node-fetch'

// BEFORE YOU RUN THIS FUNCTION: Make sure to read the README
// which contains instructions for running this "Simple Mint and Register SPG" example.

async function getImageHash(url: string): Promise<string> {
    const response = await fetch(url);
    const buffer = await response.buffer();
    const hash = createHash('sha256').update(buffer).digest('hex');
    return `0x${hash}`;
  }
  


const main = async function () {
    
    // Usage example:
        const imageUrl = 'https://blockworks.co/_next/image?url=https%3A%2F%2Fblockworks-co.imgix.net%2Fwp-content%2Fuploads%2F2023%2F06%2FSreeram-Kannan.jpg&w=384&q=75';
        const computedHash = await getImageHash(imageUrl)
        console.log("Computed image hash:", computedHash)
    
    // 1. Set up your IP Metadata
    //
    // Docs: https://docs.story.foundation/docs/ipa-metadata-standard
    const ipMetadata = {
        title: 'Sreeram Image',
        description: 'This is a test image uploaded for Story.',
        createdAt: '1740005219',
        creators: [
            {
                name: 'Shrey',
                address: '0xA2f9Cf1E40D7b03aB81e34BC50f0A8c67B4e9112',
                contributionPercent: 100,
            },
        ],
        // image: 'https://blockworks.co/_next/image?url=https%3A%2F%2Fblockworks-co.imgix.net%2Fwp-content%2Fuploads%2F2023%2F06%2FSreeram-Kannan.jpg&w=384&q=75',
        // imageHash: '0xc404730cdcdf7e5e54e8f16bc6687f97c6578a296f4a21b452d8a6ecabd61bcc',
        image: imageUrl,
        imageHash: computedHash,
        // mediaUrl: 'https://cdn1.suno.ai/dcd3076f-3aa5-400b-ba5d-87d30f27c311.mp3',
        // mediaHash: '0xb52a44f53b2485ba772bd4857a443e1fb942cf5dda73c870e2d2238ecd607aee',
        mediaType: 'image/jpeg',
    }

    // 2. Set up your NFT Metadata
    //
    // Docs: https://docs.opensea.io/docs/metadata-standards#metadata-structure
    const nftMetadata = {
        name: 'Sreeram Image',
        description: 'This is a test image uploaded for Story.',
        image: imageUrl,
        // media: [
        //     {
        //         name: 'Midnight Marriage',
        //         url: 'https://cdn1.suno.ai/dcd3076f-3aa5-400b-ba5d-87d30f27c311.mp3',
        //         mimeType: 'image/jpeg',
        //     },
        // ],
        attributes: [
            {
                key: 'Camera Provider',
                value: 'shreyb',
            },
            {
                key: 'Provider ID',
                value: '4123743b-8ba6-4028-a965-75b79a3ad424',
            },
            {
                key: 'Source',
                value: 'cameraproviderwebsite.com',
            },
        ],
    }

    // 3. Upload your IP and NFT Metadata to IPFS
    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')

    // 4. Register the NFT as an IP Asset
    //
    // Docs: https://docs.story.foundation/docs/sdk-ipasset#mintandregisterip
    const response = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: SPGNFTContractAddress,
        allowDuplicates: true,
        ipMetadata: {
            ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
            ipMetadataHash: `0x${ipHash}`,
            nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
            nftMetadataHash: `0x${nftHash}`,
        },
        txOptions: { waitForTransaction: true },
    })
    console.log(`Root IPA created at transaction hash ${response.txHash}, IPA ID: ${response.ipId}`)
    console.log(`View on the explorer: https://aeneid.explorer.story.foundation/ipa/${response.ipId}`)
}

main()
