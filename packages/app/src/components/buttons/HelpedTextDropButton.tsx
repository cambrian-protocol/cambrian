import { Box } from 'grommet'
import { DropButton } from 'grommet'
import { Info } from 'phosphor-react'
import { Text } from 'grommet'
import { cpTheme } from '@cambrian/app/theme/theme'
import HelpedTextDropContainer, {
    HelpedTextDropContainerProps,
} from '../containers/HelpedTextDropContainer'

const HelpedTextDropButton = ({
    info,
}: {
    info: HelpedTextDropContainerProps
}) => {
    return (
        <DropButton
            plain
            label={<Info size="24" color={cpTheme.global.colors['dark-4']} />}
            dropContent={
                <>
                    <HelpedTextDropContainer
                        title={info.title}
                        description={info.description}
                        link={info.link}
                    />
                </>
            }
            dropAlign={{
                bottom: 'top',
                left: 'left',
            }}
        />
    )
}

export default HelpedTextDropButton
