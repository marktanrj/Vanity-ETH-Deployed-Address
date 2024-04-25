import { ethers } from 'ethers';

// This function computes the contract address
function computeContractAddress(creatorAddress: string, nonce: number): string {
    return ethers.utils.getContractAddress({ from: creatorAddress, nonce });
}

// Brute-force search for a creator address whose first contract matches the desired prefix
async function findCreatorWithVanityContractAddress(desiredPrefix: string) {
    let found = false;
    let attempts = 0;

    while (!found) {
        const wallet = ethers.Wallet.createRandom();

        // Nonce of 0 because we are considering the first contract deployment
        const potentialContractAddress = computeContractAddress(wallet.address, 0);

        if (potentialContractAddress.startsWith(desiredPrefix)) {
            found = true;
            console.log(`Found a vanity contract address after ${attempts} attempts:`);
            console.log(`Creator Address: ${wallet.address}`);
            console.log(`Vanity Contract Address: ${potentialContractAddress}`);
            console.log(`Private Key: ${wallet.privateKey}`);
        } else {
            attempts++;
            if (attempts % 100 === 0) {
                console.log(`${attempts} attempts made so far...`);
            }
        }
    }
}

// Configuration: Set your desired prefix
const desiredPrefix = '0x111'; // Example prefix
findCreatorWithVanityContractAddress(desiredPrefix);