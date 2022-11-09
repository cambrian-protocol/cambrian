module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const ConditionalTokens = await deployments.get("ConditionalTokens");

  const erc1155Rescue = await deploy("ERC1155Rescue", {
    from: deployer,
    args: [ConditionalTokens.address],
  });

  await deploy("SolverFactory", {
    from: deployer,
    args: [ConditionalTokens.address, erc1155Rescue.address],
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
};

module.exports.tags = ["solver"];
module.exports.dependencies = ["ctf"];
