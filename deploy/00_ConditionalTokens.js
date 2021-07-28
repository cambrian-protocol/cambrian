module.exports = async () => {
    // We get the contract to deploy
    const ConditionalTokens = await ethers.getContractFactory("ConditionalTokens");
    const conditionalTokens = await ConditionalTokens.deploy();
  
    console.log("ConditionalTokens deployed to:", conditionalTokens.address);
  }
  