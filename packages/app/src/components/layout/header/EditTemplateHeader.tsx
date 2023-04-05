import { Clipboard, Eye, FloppyDisk } from 'phosphor-react'
import React, { useState } from 'react'

import BaseHeader from './BaseHeader'
import LoaderButton from '../../buttons/LoaderButton'
import ResponsiveButton from '../../buttons/ResponsiveButton'
import Template from '@cambrian/app/classes/stages/Template'
import { TemplateInputType } from '@cambrian/app/ui/templates/EditTemplateUI'
import ToggleTemplatePublishButton from '../../buttons/ToggleTemplatePublishButton'
import _ from 'lodash'
import { cpTheme } from '@cambrian/app/theme/theme'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface IEditTemplateHeader {
    template: Template
    templateInput: TemplateInputType
}

const EditTemplateHeader = ({
    template,
    templateInput,
}: IEditTemplateHeader) => {
    const [authorProfile] = useCambrianProfile(template.content.author)
    const [isSaving, setIsSaving] = useState(false)

    const onSave = async () => {
        if (template) {
            try {
                setIsSaving(true)
                const updatedTemplate = {
                    ...template.content,
                    ...templateInput,
                }
                if (!_.isEqual(updatedTemplate, template.content)) {
                    await template.updateContent(updatedTemplate)
                }
                setIsSaving(false)
            } catch (e) {
                console.error(e)
            }
        }
    }
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
                <ToggleTemplatePublishButton template={template} />,
                <LoaderButton
                    disabled={_.isEqual(template.content, templateInput)}
                    label="Save"
                    color="dark-4"
                    isLoading={isSaving}
                    size="small"
                    icon={
                        <FloppyDisk color={cpTheme.global.colors['dark-4']} />
                    }
                    onClick={onSave}
                />,
            ]}
        />
    )
}

export default EditTemplateHeader
