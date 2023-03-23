import { CheckCircle, PauseCircle } from 'phosphor-react'
import React, { useState } from 'react'

import LoaderButton from './LoaderButton'
import Template from '@cambrian/app/classes/stages/Template'
import { cpTheme } from '@cambrian/app/theme/theme'

interface IToggleTemplatePublishButton {
    template: Template
}

const ToggleTemplatePublishButton = ({
    template,
}: IToggleTemplatePublishButton) => {
    const [isTogglingActive, setIsTogglingActive] = useState(false)
    const toggleIsActive = async () => {
        if (template) {
            try {
                setIsTogglingActive(true)
                if (template.content.isActive) {
                    await template.unpublish()
                } else {
                    await template.publish()
                }
            } catch (e) {
                console.error(e)
            }
            setIsTogglingActive(false)
        }
    }

    return (
        <LoaderButton
            isLoading={isTogglingActive}
            icon={
                template.content.isActive ? (
                    <CheckCircle color={cpTheme.global.colors['status-ok']} />
                ) : (
                    <PauseCircle
                        color={cpTheme.global.colors['status-error']}
                    />
                )
            }
            label={
                template.content.isActive
                    ? 'Open for proposals'
                    : 'Closed for propsals'
            }
            onClick={toggleIsActive}
        />
    )
}

export default ToggleTemplatePublishButton
