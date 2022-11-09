module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("ToyToken", {
    from: deployer,
    args: ["TOY", "TOY"],
    log: true,
  });
};

module.exports.tags = ["toy"];
