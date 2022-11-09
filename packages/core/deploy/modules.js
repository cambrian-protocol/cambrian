module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("IPFSTextSubmitter", {
    from: deployer,
    log: true,
  });

  await deploy("Unanimity", {
    from: deployer,
    log: true,
  });
};

module.exports.tags = ["modules"];
