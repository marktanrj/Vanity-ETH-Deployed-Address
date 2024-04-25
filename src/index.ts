import { Worker } from 'worker_threads';
const numWorkers = 4; // Number of parallel workers

function startWorker(desiredPrefix: string) {
    return new Promise<void>((resolve, reject) => {
        const worker = new Worker('./src/worker.js');
        worker.postMessage(desiredPrefix);

        worker.on('message', (message) => {
            if (message.status === 'found') {
                console.log(`Found a vanity contract address after ${message.attempts} attempts:`);
                console.log(`Creator Address: ${message.creatorAddress}`);
                console.log(`Vanity Contract Address: ${message.contractAddress}`);
                console.log(`Private Key: ${message.privateKey}`);
                resolve();
                process.exit(0);
            } else if (message.status === 'progress') {
                console.log(`${message.attempts} attempts made so far by a worker...`);
            }
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

async function findCreatorWithVanityContractAddress(desiredPrefix: string) {
    const promises = [];
    for (let i = 0; i < numWorkers; i++) {
        promises.push(startWorker(desiredPrefix));
    }
    await Promise.all(promises);
}

const desiredPrefix = '0x999'; // Example prefix
findCreatorWithVanityContractAddress(desiredPrefix);