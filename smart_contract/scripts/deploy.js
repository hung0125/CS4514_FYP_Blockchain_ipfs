/*
deploy contracts: npx hardhat run scripts/deploy.js --network goerli (放testnet) || npx hardhat run --network localhost scripts/deploy.js (放local)
after deployment: 
  - copy the deployed address to 'app/utils/constants.js'
  - copy 'contracts/{contract name}.json' to 'app/utils/{contract name}.json'
  - in 'app/context' folder, create {contract name}Context.jsx

local blockchain setup:
  - Set the chain ID of Metamask localhost to 31337 (restart browser whenever error generates)
  - Start local server: npx hardhat node
  - Do everytime after starting the server:
    -- Deploy contracts
    -- Reset Metamask accounts
*/

const main = async() => {
  const Contract = await hre.ethers.getContractFactory("FileEvents"); //i.e. The target contract name without '.sol'
  const contract = await Contract.deploy();

  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

const mainlocal = async() => {
  const names = ["FileManagement", "ProfileMgnt"];

  for (var i = 0; i < names.length; i++){
    const Contract = await hre.ethers.getContractFactory(names[i]); //i.e. The target contract name without '.sol'
    const contract = await Contract.deploy();

    await contract.deployed();

    console.log(`Contract ${names[i]} deployed to: ${contract.address}`);
  }
    
  
}

const runMain = async() => {
  try {
    await mainlocal();
    process.exit(0);
  }catch(error){
    console.error(error);
    process.exit(1);
  }
}

runMain();
