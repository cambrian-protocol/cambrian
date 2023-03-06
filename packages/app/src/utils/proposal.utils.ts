import { ProposalStatus } from "../models/ProposalStatus";

export const isStatusValid = (status: ProposalStatus, validStatuses: ProposalStatus[]) => {
    if (validStatuses.includes(status)) {
        return true
    } else {
        return false
    }
}

