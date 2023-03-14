import BaseHeader from './BaseHeader'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import React from 'react'
import TemplateLinkButton from '../../buttons/TemplateLinkButton'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface ITemplateModalHeader {
    templateDoc: DocumentModel<TemplateModel>
}

const TemplateModalHeader = ({ templateDoc }: ITemplateModalHeader) => {
    const [templateProfile] = useCambrianProfile(templateDoc.content.author)
    return (
        <BaseHeader
            title={templateDoc.content.title}
            metaTitle="Template"
            items={[
                <TemplateLinkButton templateStreamID={templateDoc.streamID} />,
            ]}
            authorProfileDoc={templateProfile}
        />
    )
}
export default TemplateModalHeader
