const { parentPort } = require('worker_threads');
const { ethers } = require('ethers');

function computeContractAddress(creatorAddress, nonce) {
    return ethers.utils.getContractAddress({ from: creatorAddress, nonce });
}

let active = true;

parentPort.on('message', (message) => {
    if (message.command === 'find') {
        const desiredPrefix = message.desiredPrefix;
        let attempts = 0;

        while (active) {
            const wallet = ethers.Wallet.createRandom();
            const potentialContractAddress = computeContractAddress(wallet.address, 0);

            if (potentialContractAddress.startsWith(desiredPrefix)) {
                active = false;
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
    } else if (message.command === 'stop') {
        active = false;
    }
});