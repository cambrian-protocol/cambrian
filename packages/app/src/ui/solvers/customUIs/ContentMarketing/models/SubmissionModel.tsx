import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'

export type SubmissionModel = {
    submission: string
    sender: ParticipantModel
    conditionId: string
    timestamp?: Date
}
