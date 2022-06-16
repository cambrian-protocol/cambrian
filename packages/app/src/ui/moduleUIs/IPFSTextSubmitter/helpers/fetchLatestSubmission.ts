import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SubmissionModel } from '../models/SubmissionModel'
import { ethers } from 'ethers'

export const fetchSubmissions = async (
    logs: ethers.Event[],
    currentCondition: SolverContractCondition
): Promise<SubmissionModel[] | undefined> => {
    const cids = logs.map((l) => l.args?.cid).filter(Boolean)
    const ipfs = new IPFSAPI()
    const allSubmissions = (await ipfs.getManyFromCID(
        cids
    )) as SubmissionModel[]

    if (!allSubmissions) throw GENERAL_ERROR['IPFS_FETCH_ERROR']

    const currentConditionSubmissions = allSubmissions.filter(
        (x) => x.conditionId === currentCondition.conditionId
    )

    return currentConditionSubmissions
}
