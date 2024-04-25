const { parentPort } = require('worker_threads');
const { ethers } = require('ethers');

function computeContractAddress(creatorAddress, nonce) {
    return ethers.utils.getContractAddress({ from: creatorAddress, nonce });
}

parentPort.on('message', async (desiredPrefix) => {
    let found = false;
    let attempts = 0;

    while (!found) {
        const wallet = ethers.Wallet.createRandom();
        const potentialContractAddress = computeContractAddress(wallet.address, 0);

        if (potentialContractAddress.startsWith(desiredPrefix)) {
            found = true;
            parentPort.postMessage({
                status: 'found',
                attempts: attempts,
                creatorAddress: wallet.address,
                contractAddress: potentialContractAddress,
                privateKey: wallet.privateKey
            });
            break;
        } else {
            attempts++;
            if (attempts % 100 === 0) {
                parentPort.postMessage({ status: 'progress', attempts });
            }
        }
    }
});