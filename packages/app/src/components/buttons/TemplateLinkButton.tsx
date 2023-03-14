import { ArrowUpRight } from 'phosphor-react'
import React from 'react'
import ResponsiveButton from './ResponsiveButton'
import { cpTheme } from '@cambrian/app/theme/theme'

interface ITemplateLinkButton {
    templateStreamID: string
}

const TemplateLinkButton = ({ templateStreamID }: ITemplateLinkButton) => {
    return (
        <ResponsiveButton
            label="Open Template"
            icon={<ArrowUpRight color={cpTheme.global.colors['dark-4']} />}
            href={`/solver/${templateStreamID}`}
        />
    )
}

export default TemplateLinkButton
