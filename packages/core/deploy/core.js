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

  const proposalsHub = await deploy("ProposalsHub", {
    from: deployer,
    args: [conditionalTokens.address],
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

  // await deploy("WriterSolverV1", {
  //   from: deployer,
  //   args: [],
  //   libraries: {
  //     SolverLib: solverLib.address,
  //   },
  //   log: true,
  // });

  await deploy("ArbitrationDispatch", {
    from: deployer,
    args: [],
    log: true,
  });

  await deploy("IPFSSolutionsHub", {
    from: deployer,
    args: [solverFactory.address, proposalsHub.address],
    log: true,
  });

  // await deploy("pWRK", {
  //   from: deployer,
  //   args: ["Placeholder WRK", "pWRK"],
  //   log: true,
  // });

  await deploy("ArbitratorFactory", {
    from: deployer,
    log: true,
  });

  await deploy("IPFSTextSubmitter", {
    from: deployer,
    log: true,
  });

  await deploy("Unanimity", {
    from: deployer,
    log: true,
  });

  await deploy("BasicArbitrator", {
    from: deployer,
    log: true,
  });
};

module.exports.tags = [
  "ConditionalTokens",
  "SolverFactory",
  "ProposalsHub",
  "SolverLib",
  "BasicSolverV1",
  "ToyToken",
  // "WriterSolverV1",
  "ArbitrationDispatch",
  "IPFSSolutionsHub",
  // "pWRK",
  "ArbitratorFactory",
  "IPFSTextSubmitter",
  "Unanimity",
  "BasicArbitrator",
];
