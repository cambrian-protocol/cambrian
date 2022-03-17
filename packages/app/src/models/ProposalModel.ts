import { BigNumber } from 'ethers'
import { ParticipantModel } from './ParticipantModel'

export type ProposalModel = {
    id: string
    title: string
    buyer: ParticipantModel
    description: string
    amount: BigNumber
}
