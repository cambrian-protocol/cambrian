module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();

  const solverLib =   await deploy('SolverLib', {
    from: deployer,
    args: [],
    log: true,
  })

  await deploy("BasicSolverV1", {
    from: deployer,
    args: [],
    libraries: {
      SolverLib: solverLib.address
    },
    log: true,
  })
};
module.exports.tags = ["BasicSolverV1"];
