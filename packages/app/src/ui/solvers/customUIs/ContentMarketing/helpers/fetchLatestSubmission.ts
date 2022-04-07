import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SubmissionModel } from '../models/SubmissionModel'
import { ethers } from 'ethers'

export const fetchLatestSubmission = async (
    logs: ethers.Event[],
    currentCondition: SolverContractCondition
): Promise<SubmissionModel | undefined> => {
    const cids = logs.map((l) => l.args?.cid).filter(Boolean)
    const ipfs = new IPFSAPI()
    const allSubmissions = (await ipfs.getManyFromCID(
        cids
    )) as SubmissionModel[]

    if (!allSubmissions)
        throw new Error('Something went wrong whole fetching from IPFS')

    const currentConditionSubmissions = allSubmissions.filter(
        (x) => x.conditionId === currentCondition.conditionId
    )

    return currentConditionSubmissions[currentConditionSubmissions.length - 1]
}
