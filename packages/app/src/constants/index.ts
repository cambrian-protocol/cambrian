import BasicSolverArtifact from '@cambrian/core/artifacts/contracts/Solver.sol/Solver.json'
import ERC20 from '@cambrian/core/artifacts/contracts/ToyToken.sol/ToyToken.json'
import CTF from '@cambrian/core/artifacts/contracts/ConditionalTokens.sol/ConditionalTokens.json'
import { utils } from 'ethers'

export const MAX_POINTS = 10000
export const DEFAULT_ABI = BasicSolverArtifact.abi
export const DEFAULT_IFACE = new utils.Interface(BasicSolverArtifact.abi)
export const ERC20_ABI = new utils.Interface(ERC20.abi)
export const CERAMIC_NETWORK = 'https://127.0.0.1:7001'
export const PIN_ENDPOINT =
    'https://kdjzxk3x7a.execute-api.us-east-1.amazonaws.com/pinPinata'

export const LOCAL_PIN_ENDPOINT = 'http://127.0.0.1:5002/api/v0/add'

export const CTF_IFACE = new utils.Interface(CTF.abi)
