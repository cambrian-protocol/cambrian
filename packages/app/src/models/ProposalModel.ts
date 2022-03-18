import { BigNumber } from 'ethers'
import { ParticipantModel } from './ParticipantModel'
import { SolutionModel } from '@cambrian/app/models/SolutionModel'

export type ProposalModel = {
    id: string
    title: string
    buyer: ParticipantModel
    description: string
    amount: BigNumber
    solution: SolutionModel
}
