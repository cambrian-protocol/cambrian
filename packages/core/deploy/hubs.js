module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const ConditionalTokens = await deployments.get("ConditionalTokens");
  const SolverFactory = await deployments.get("SolverFactory");

  const proposalsHub = await deploy("ProposalsHub", {
    from: deployer,
    args: [ConditionalTokens.address],
    log: true,
  });

  await deploy("IPFSSolutionsHub", {
    from: deployer,
    args: [SolverFactory.address, proposalsHub.address],
    log: true,
  });
};

module.exports.tags = ["hubs"];
module.exports.dependencies = ["solver", "ctf"];
