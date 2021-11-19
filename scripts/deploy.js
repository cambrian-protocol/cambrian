async function deploy(name) {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Contract = await ethers.getContractFactory(name);
  const contract = await Contract.deploy();

  console.log("ConditionalTokens address:", contract.address);
}

async function main() {
  await deploy('ConditionalTokens')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
