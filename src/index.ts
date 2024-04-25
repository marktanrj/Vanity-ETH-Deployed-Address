import { Worker } from 'worker_threads';
const numWorkers = 4; // Number of parallel workers

let workers: any = [];

function startWorker(desiredPrefix: string) {
    const worker = new Worker('./src/worker.js');
    worker.postMessage({ command: 'find', desiredPrefix: desiredPrefix });

    worker.on('message', (message) => {
        if (message.status === 'found') {
            console.log(`Found a vanity contract address after ${message.attempts} attempts:`);
            console.log(`Creator Address: ${message.creatorAddress}`);
            console.log(`Vanity Contract Address: ${message.contractAddress}`);
            console.log(`Private Key: ${message.privateKey}`);

            workers.forEach((w: any) => w.postMessage({ command: 'stop' })); // Stop all workers
        } else if (message.status === 'progress') {
            console.log(`${message.attempts} attempts made so far by a worker...`);
        }
    });

    worker.on('error', error => console.error(error));
    worker.on('exit', (code) => {
        if (code !== 0)
            console.log(`Worker stopped with exit code ${code}`);
    });

    workers.push(worker);
}

async function findCreatorWithVanityContractAddress(desiredPrefix: string) {
    for (let i = 0; i < numWorkers; i++) {
        startWorker(desiredPrefix);
    }
}

const desiredPrefix = '0x000'; // Example prefix
findCreatorWithVanityContractAddress(desiredPrefix);