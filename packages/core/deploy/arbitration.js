module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("ArbitrationDispatch", {
    from: deployer,
    args: [],
    log: true,
  });

  await deploy("ArbitratorFactory", {
    from: deployer,
    log: true,
  });

  await deploy("BasicArbitrator", {
    from: deployer,
    log: true,
  });
};

module.exports.tags = ["arbitration"];
