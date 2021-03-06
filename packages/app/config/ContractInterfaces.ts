import ArbitrationDispatchArtifact from '@cambrian/core/artifacts/contracts/arbitration/ArbitrationDispatch.sol/ArbitrationDispatch.json'
import ArbitratorFactoryArtifact from '@cambrian/core/artifacts/contracts/arbitration/ArbitratorFactory.sol/ArbitratorFactory.json'
import BaseSolverArtifact from '@cambrian/core/artifacts/contracts/solvers/Solver.sol/Solver.json'
import BasicArbitratorArtifact from '@cambrian/core/artifacts/contracts/arbitration/BasicArbitrator.sol/BasicArbitrator.json'
import CTFArtifact from '@cambrian/core/artifacts/contracts/conditionalTokens/ConditionalTokens.sol/ConditionalTokens.json'
import ERC20Artifact from '@cambrian/core/artifacts/contracts/tokens/ToyToken.sol/ToyToken.json'
import IpfsSolutionsHubArtifact from '@cambrian/core/artifacts/contracts/hubs/IPFSSolutionsHub.sol/IPFSSolutionsHub.json'
import ProposalsHubArtifact from '@cambrian/core/artifacts/contracts/hubs/ProposalsHub.sol/ProposalsHub.json'
import IPFSTextSubmitterArtifact from '@cambrian/core/artifacts/contracts/modules/IPFSTextSubmitter.sol/IPFSTextSubmitter.json'
import { utils } from 'ethers'

// Solvers
export const BASE_SOLVER_IFACE = new utils.Interface(BaseSolverArtifact.abi)
// export const WRITER_IFACE = new utils.Interface(WriterSolverArtifact.abi)

// Hubs
export const PROPOSALS_HUB_IFACE = new utils.Interface(ProposalsHubArtifact.abi)
export const IPFS_SOLUTIONS_HUB_IFACE = new utils.Interface(
    IpfsSolutionsHubArtifact.abi
)

// Arbitration
export const BASIC_ARBITRATOR_IFACE = new utils.Interface(
    BasicArbitratorArtifact.abi
)
export const ARBITRATOR_FACTORY_IFACE = new utils.Interface(
    ArbitratorFactoryArtifact.abi
)
export const ARBITRATION_DISPATCH_IFACE = new utils.Interface(
    ArbitrationDispatchArtifact.abi
)

// Modules
export const IPFS_TEXT_SUBMITTER_IFACE = new utils.Interface(
    IPFSTextSubmitterArtifact.abi
)

// External Interfaces
export const ERC20_IFACE = new utils.Interface(ERC20Artifact.abi)
export const CTF_IFACE = new utils.Interface(CTFArtifact.abi)
