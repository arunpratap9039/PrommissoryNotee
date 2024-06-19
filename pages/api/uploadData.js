import {Web3Storage, getFilesFromPath } from 'web3.storage';
import { filesFromPaths } from 'files-from-path'
const {ethers} = require('ethers');
import * as Constants from "../constant";
import formidable from 'formidable';
import path from 'path';
import { create } from '@web3-storage/w3up-client';
import * as Client from '@web3-storage/w3up-client'



export const config = {
    api: {
        bodyParser: false    // disable built-in body parser
    }
}

function moveFiletoServer(req) {
    return new Promise((resolve, reject) => {
        const options = {};
        options.uploadDir = path.join(process.cwd(), "/pages/uploads");
        options.filename = (name, ext, path, form) => {
            return path.originalFilename;
        }
        const form = formidable(options);

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error(err);
                reject("Something went wrong");
                return;
            }
            const uniqueFileName = fields.filename;
            const actualFileName = files.file.originalFilename;

            resolve({uniqueFileName, actualFileName});
        })
    })
}


async function storeDataInBlockchain(actualFileName, uniqueFileName) {
    const provider = new ethers.providers.JsonRpcProvider(Constants.API_URL);
    const signer = new ethers.Wallet(Constants.PRIVATE_KEY, provider);
    const StorageContract = new ethers.Contract(Constants.contractAddress, Constants.contractAbi, signer);

    const isStored = await StorageContract.isFileStored(uniqueFileName);

    console.log(isStored);

    if (isStored == false) {
        
        const storage = await create()
        console.log('client', storage.did())

        const space = await storage.createSpace('my-awesome-space')
        const myAccount = await storage.login('arun.kustwar.23@gmail.com')
        // wait for payment plan to be selected
        while (true) {
            const res = await myAccount.plan.get()
            if (res.ok) break
            console.log('Waiting for payment plan to be selected...')
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        await myAccount.provision(space.did())
        await space.save()
        const uploadPath = path.join(process.cwd(), "./pages/uploads/");
        console.log("uploadPath is : ", uploadPath);
        const files = await getFilesFromPath(uploadPath, `/${actualFileName}`);
        console.log("file is : ", files);
        const cid = await storage.uploadFile(files)
        let hash = cid.toString();
        // await sharkDaoSpace.save()
        console.log("Storing the data in IPFS");
        const tx = await StorageContract.upload(uniqueFileName, hash);
        await tx.wait();
        const storedhash = await StorageContract.getIPFSHash(uniqueFileName);
        return {message: `IPFS hash is stored in the smart contract: ${storedhash}`}


        // myAccount = await storage.login('arun.kustwar.23@gmail.com')
        // const sharkDaoSpace = await storage.createSpace('sharkDAO.xyz')
        // await myAccount.provision(sharkDaoSpace.did())
        // await storage.addSpace(await sharkDaoSpace.createAuthorization(storage))
        // await storage.setCurrentSpace(sharkDaoSpace.did())
        // const uploadPath = path.join(process.cwd(), "/pages/uploads");
        // console.log("uploadPath is : ", uploadPath);
        // const files = await getFilesFromPath(uploadPath, `/${actualFileName}`);
        // console.log("file is : ", files);
        // const cid = await storage.uploadDirectory(files)
        // let hash = cid.toString();
        // // await sharkDaoSpace.save()
        // console.log("Storing the data in IPFS");
        // const tx = await StorageContract.upload(uniqueFileName, hash);
        // await tx.wait();
        // const storedhash = await StorageContract.getIPFSHash(uniqueFileName);
        // return {message: `IPFS hash is stored in the smart contract: ${storedhash}`}




        // await storage.setCurrentSpace('z4MXj1wBzi9jUstyPvJWLDwMc2xX2haCe7fLWjL2CgfvwvPrwxSiZxNEAuQ87GMxYi2UuFauh3WhBkJH3bJkrsSXedYXBBvUaY5j7ksw4sTs5fdMZgyfUenobmxWdsQ5TTTe79qC7Js96JwjhVoNQ5Bmb26eVZamK2vtkE8Wg6MxzCjKvAQT2xds5nn44Yurskkp2gYL8NYo7wsdD2HLUNTpNaWMg8fAqTYUhowofzpJepJW1po34G34CBsX2PvbedDkQU2SRhp3UTC1UncyNfte4nJMdiaACSPapvfSTP11KuqmYfkxSNwCo9vJzxLWQsNhnhAhggqfzJyGxj7tDNJM2WVS3FCTGnkr3moVyBbxa2GAweas2');
        // const uploadPath = path.join(process.cwd(), "/pages/uploads");
        // const files = await getFilesFromPath(uploadPath, `/${actualFileName}`);
        // const cid = await storage.uploadDirectory(files)
        // let hash = cid.toString();
        // console.log("Storing the data in IPFS");
        // const tx = await StorageContract.upload(uniqueFileName, hash);
        // await tx.wait();
        // const storedhash = await StorageContract.getIPFSHash(uniqueFileName);
        // return {message: `IPFS hash is stored in the smart contract: ${storedhash}`}

        // const token = "z6Mkgo4btoiG3NsNmUCPbwbNeDdwes7hQozgfV7Vi9ZsVi9G";
        // const storage = new Web3Storage({token: token});
        // const uploadPath = path.join(process.cwd(), "/pages/uploads");
        // const files = await getFilesFromPath(uploadPath, `/${actualFileName}`);
        // const cid = await storage.put(files);
        // let hash = cid.toString();
        // console.log("Storing the data in IPFS");
        // const tx = await StorageContract.upload(uniqueFileName, hash);
        // await tx.wait();
        // const storedhash = await StorageContract.getIPFSHash(uniqueFileName);
        // return {message: `IPFS hash is stored in the smart contract: ${storedhash}`}
    }

    else {
        console.log("Data is already stored for this file name");
        const IPFShash = await StorageContract.getIPFSHash(uniqueFileName);
        return {message: `IPFS hash is already stored in the smart contract: ${IPFShash}`}
    }
}
// we are moving files from local pc to this server directoy
// we are going to store file in IPFS
// we are going to store IPFS hash in blockchain
async function handler(req, res) {
    try {
        const {uniqueFileName, actualFileName} = await moveFiletoServer(req)
        console.log("Files are stored in local server");

        await new Promise(resolve => setTimeout(resolve, 2000));  //waiting for 2 seconds

        const resposne = await storeDataInBlockchain(actualFileName, uniqueFileName)
        console.log("Hash stored in smart contract");

        return res.status(200).json(resposne);
    }
    catch (err) {
        console.error(err);
    }
}

export default handler;