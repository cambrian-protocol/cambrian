import BaseSolverArtifact from '@cambrian/core/artifacts/contracts/solvers/Solver.sol/Solver.json'
import BasicArbitratorArtifact from '@cambrian/core/artifacts/contracts/arbitration/BasicArbitrator.sol/BasicArbitrator.json'
import CTFArtifact from '@cambrian/core/artifacts/contracts/conditionalTokens/ConditionalTokens.sol/ConditionalTokens.json'
import ERC20Artifact from '@cambrian/core/artifacts/contracts/tokens/ToyToken.sol/ToyToken.json'
import IpfsSolutionsHubArtifact from '@cambrian/core/artifacts/contracts/IPFSSolutionsHub.sol/IPFSSolutionsHub.json'
import ProposalsHubArtifact from '@cambrian/core/artifacts/contracts/ProposalsHub.sol/ProposalsHub.json'
import WriterSolverArtifact from '@cambrian/core/artifacts/contracts/solvers/WriterSolverV1.sol/WriterSolverV1.json'
import { utils } from 'ethers'

// Solvers
export const BASE_SOLVER_IFACE = new utils.Interface(BaseSolverArtifact.abi)
export const WRITER_IFACE = new utils.Interface(WriterSolverArtifact.abi)

// Hubs
export const PROPOSALS_HUB_IFACE = new utils.Interface(ProposalsHubArtifact.abi)
export const IPFS_SOLUTIONS_HUB_IFACE = new utils.Interface(
    IpfsSolutionsHubArtifact.abi
)

/* // Arbitration
export const ARBITRATOR_FACTORY_IFACE = new utils.Interface(
    ArbitratorFactoryArtifact.abi
) */
export const BASIC_ARBITRATOR_IFACE = new utils.Interface(
    BasicArbitratorArtifact.abi
)

// External Interfaces
export const ERC20_IFACE = new utils.Interface(ERC20Artifact.abi)
export const CTF_IFACE = new utils.Interface(CTFArtifact.abi)
