import { CheckCircle, PauseCircle } from 'phosphor-react'
import React, { useState } from 'react'

import LoaderButton from './LoaderButton'
import { ResponsiveContext } from 'grommet'
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
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <LoaderButton
                        isLoading={isTogglingActive}
                        size="small"
                        color={'dark-4'}
                        icon={
                            template.content.isActive ? (
                                <CheckCircle
                                    color={cpTheme.global.colors['status-ok']}
                                />
                            ) : (
                                <PauseCircle
                                    color={
                                        cpTheme.global.colors['status-error']
                                    }
                                />
                            )
                        }
                        label={
                            screenSize !== 'small'
                                ? template.content.isActive
                                    ? 'Open for Proposals'
                                    : 'Closed for Propsals'
                                : null
                        }
                        onClick={toggleIsActive}
                    />
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default ToggleTemplatePublishButton
