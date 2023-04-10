import { DocumentModel } from "../services/api/cambrian.api"
import { ProposalModel } from '../models/ProposalModel';
import { TemplateModel } from '@cambrian/app/models/TemplateModel';
import { UserType } from "../store/UserContext"

export const checkAuthorization = (auth: UserType, doc: DocumentModel<TemplateModel | ProposalModel>) => {
    if (auth.did !== doc.content.author) {
        console.error('Unauthorized!')
        return false
    }
    return true
}