import BaseHeader from './BaseHeader'
import React from 'react'
import SolverConfigInfoButton from '../../buttons/SolverConfigInfoButton'
import Template from '@cambrian/app/classes/stages/Template'
import { mergeFlexIntoComposition } from '@cambrian/app/utils/helpers/flexInputHelpers'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface ITemplateHeader {
    template: Template
}

const TemplateHeader = ({ template }: ITemplateHeader) => {
    const [templaterProfile] = useCambrianProfile(template.content.author)

    return (
        <BaseHeader
            metaTitle="Template"
            title={template.content.title}
            authorProfileDoc={templaterProfile}
            items={[
                <SolverConfigInfoButton
                    composition={mergeFlexIntoComposition(
                        template.compositionDoc.content,
                        template.content.flexInputs
                    )}
                    price={{
                        amount:
                            typeof template.content.price.amount === 'string'
                                ? 0
                                : template.content.price.amount,
                        token: template.denominationToken,
                    }}
                />,
            ]}
        />
    )
}

export default TemplateHeader
