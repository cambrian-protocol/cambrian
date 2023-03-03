import { ProposalStatus } from "../models/ProposalStatus";

export const isStatusValid = (status: ProposalStatus, validStatuses: ProposalStatus[]) => {
    if (validStatuses.includes(status)) {
        return true
    } else {
        console.error('Invalid status!')
        return false
    }
}

