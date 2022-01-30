module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const conditionalTokens = await deploy("ConditionalTokens", {
    from: deployer,
    args: [],
    log: true,
  });

  const solverFactory = await deploy("SolverFactory", {
    from: deployer,
    args: [conditionalTokens.address],
    log: true,
  });

  await deploy("ProposalsHub", {
    from: deployer,
    args: [conditionalTokens.address],
    log: true,
  });

  await deploy("IPFSSolutionsHub", {
    from: deployer,
    args: [solverFactory.address],
    log: true,
  });

  const solverLib = await deploy("SolverLib", {
    from: deployer,
    args: [],
    log: true,
  });

  await deploy("BasicSolverV1", {
    from: deployer,
    args: [],
    libraries: {
      SolverLib: solverLib.address,
    },
    log: true,
  });

  await deploy("ToyToken", {
    from: deployer,
    args: ["TOY", "TOY"],
    log: true,
  });

  await deploy("IPFSSolutionsHub", {
    from: deployer,
    args: [solverFactory.address],
    log: true,
  });

  await deploy("SolutionsHub", {
    from: deployer,
    args: [solverFactory.address],
    log: true,
  });
};
module.exports.tags = [
  "ConditionalTokens",
  "SolverFactory",
  "ProposalsHub",
  "IPFSSolutionsHub",
  "SolverLib",
  "BasicSolverV1",
  "ToyToken",
  "SolutionsHub",
];
