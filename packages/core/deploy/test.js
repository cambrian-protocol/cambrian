module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const ERC1155Rescue = await deployments.get("ERC1155Rescue");

  await deploy("ERC1155Unsafe", {
    from: deployer,
    args: [ERC1155Rescue.address],
  });
};

module.exports.tags = ["test"];
module.exports.dependencies = [
  "arbitration",
  "ctf",
  "hubs",
  "modules",
  "solver",
  "toy",
];
