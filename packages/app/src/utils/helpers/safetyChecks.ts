import _, { result } from 'lodash'

import CTFContract from '@cambrian/app/contracts/CTFContract'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolverConfigModel } from '@cambrian/app/models/SolverConfigModel'
import { StageStackType } from '@cambrian/app/ui/dashboard/ProposalsDashboardUI'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { getParsedSolvers } from './proposalHelper'
import PROPOSALSHUB_GOERLI from '@cambrian/core/deployments/goerli/ProposalsHub.json'
import PROPOSALSHUB_ARBITRUM from '@cambrian/core/deployments/arbitrum/ProposalsHub.json'

const PROPOSALHUBS = [
    PROPOSALSHUB_GOERLI.address,
    PROPOSALSHUB_ARBITRUM.address,
]

/**
 * IMPORTANT
 * We are currently only deploying individual Solvers with manual & constant slots
 * If a manual recipient is inputted wrong, a new condition can be created to correct the error
 * Most likely failure case today is that a constant recipient cannot receive CTs
 *
 * This safetyCheck, which we will expand on DILIGENTLY...
 * ...tries to send 0 CTs to each constant recipient address...
 * ... and returns an object of whether the tx succeeded (true) or did not (false)...
 * ... in which case we should display a warning and additional information on the Proposal
 *
 * We can put this check in other places throughout the app to try and prevent mistakes
 *
 */
export type SolverSafetyCheckResponseType = { to: string; result: boolean }[][]

export const solverSafetyCheck = async (
    stageStack: StageStackType,
    currentUser: UserType
): Promise<SolverSafetyCheckResponseType | undefined> => {
    const parsedSolvers = await getParsedSolvers(stageStack, currentUser)
    if (parsedSolvers) {
        const configs = parsedSolvers.map((solver) => solver.config)
        return await Promise.all(
            configs.map((config) =>
                checkConstantRecipients(config, currentUser)
            )
        )
    }
}

export const checkConstantRecipients = async (
    config: SolverConfigModel,
    currentUser: UserType
) => {
    const CTF = new CTFContract(currentUser.signer, currentUser.chainId)

    const recipientSlotIDs = config.conditionBase.allocations.map(
        (allocPath) => allocPath.recipientAddressSlot
    )

    const constantIngests = config.ingests.filter(
        (ingest) => ingest.ingestType === SlotType.Constant
    )

    // Get all constant-slot recipients with no duplicates
    const constantRecipientAddresses = _.uniq(
        constantIngests
            .filter((ingest) => recipientSlotIDs.includes(ingest.slot))
            .map(
                (ingest) =>
                    ethers.utils.defaultAbiCoder.decode(
                        ['address'],
                        ingest.data
                    )[0]
            )
    )

    const results = await Promise.all(
        constantRecipientAddresses.map(async (address) =>
            tryTransferCT(currentUser.address, address, CTF)
        )
    )

    return results
}

export const tryTransferCT = async (
    from: string,
    to: string,
    CTF: CTFContract
) => {
    try {
        if (PROPOSALHUBS.includes(to)) {
            return {
                to: to,
                result: true,
            }
        }
        await CTF.contract.callStatic.safeBatchTransferFrom(
            from, // from
            to, // to
            [42], // tokenID // arbitratory tokenID is fine for a value of 0
            [0], //value
            ethers.constants.HashZero // data
        )
        return {
            to: to,
            result: true,
        }
    } catch (e) {
        console.warn(e)
        return {
            to: to,
            result: false,
        }
    }
}
