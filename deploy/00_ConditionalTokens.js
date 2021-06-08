module.exports = async () => {
    // We get the contract to deploy
    const ConditionalTokens = await ethers.getContractFactory("ConditionalTokens");
    const conditionalTokens = await ConditionalTokens.deploy();
  
    console.log("ConditionalTokens deployed to:", conditionalTokens.address);
  }
  
  // main()
  //   .then(() => process.exit(0))
  //   .catch(error => {
  //     console.error(error);
  //     process.exit(1);
  //   });