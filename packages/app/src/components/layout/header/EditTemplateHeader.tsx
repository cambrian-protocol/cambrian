import { Clipboard, Eye } from 'phosphor-react'

import BaseHeader from './BaseHeader'
import React from 'react'
import ResponsiveButton from '../../buttons/ResponsiveButton'
import Template from '@cambrian/app/classes/stages/Template'
import { cpTheme } from '@cambrian/app/theme/theme'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface IEditTemplateHeader {
    template: Template
}

const EditTemplateHeader = ({ template }: IEditTemplateHeader) => {
    const [authorProfile] = useCambrianProfile(template.content.author)

    return (
        <BaseHeader
            authorProfileDoc={authorProfile}
            title={template.content.title || 'Untitled'}
            metaTitle="Edit Template"
            items={[
                <ResponsiveButton
                    label="View Template"
                    icon={<Eye color={cpTheme.global.colors['dark-4']} />}
                    href={`/solver/${template.doc.streamID}`}
                />,
                <ResponsiveButton
                    label="Copy URL"
                    icon={<Clipboard color={cpTheme.global.colors['dark-4']} />}
                    value={`${window.location.host}/solver/${template.doc.streamID}`}
                />,
            ]}
        />
    )
}

export default EditTemplateHeader
