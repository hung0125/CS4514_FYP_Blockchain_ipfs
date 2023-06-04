import { ethers } from 'ethers';
import abi_FileManagement from './contract/FileManagement.json';
const {ethereum} = window;
const provider = new ethers.providers.Web3Provider(ethereum);
const signer = provider.getSigner();

export const contractAddress_File = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
export const contractAddress_Profile = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
export const IPFSLocalAPI = 'http://127.0.0.1:5001/api/v0';
export const contract_FileManagement = new ethers.Contract(contractAddress_File, abi_FileManagement.abi, signer);
