/*deploy contracts: npx hardhat run scripts/deploy.js --network goerli
after deployment: 
  - copy the deployed address to 'app/utils/constants.js'
  - copy 'contracts/{contract name}.json' to 'app/utils/{contract name}.json'
  - in 'app/context' folder, create {contract name}Context.jsx
*/

const main = async() => {
  const Contract = await hre.ethers.getContractFactory("Transactions"); //i.e. The contract name without '.sol'
  const contract = await Contract.deploy();

  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

const runMain = async() => {
  try {
    await main();
    process.exit(0);
  }catch(error){
    console.error(error);
    process.exit(1);
  }
}

runMain();