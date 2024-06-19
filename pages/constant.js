export const API_URL = "https://eth-holesky.blastapi.io/ee728cc4-2cc0-4b5e-9515-8056a00e5e72";
export const PRIVATE_KEY ="6c0b0177df369e0dadb20f18806b81e97bd8aefa9e965899c45c936c38387c20";
export const contractAddress = "0x5d4125d1ceac76e875120c8b7d58dc4572431b87";
export const contractAbi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "fileName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			}
		],
		"name": "upload",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "fileName",
				"type": "string"
			}
		],
		"name": "getIPFSHash",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "fileName",
				"type": "string"
			}
		],
		"name": "isFileStored",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];