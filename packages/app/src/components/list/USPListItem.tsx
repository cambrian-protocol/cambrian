import { Box } from 'grommet'
import FadeIn from '@cambrian/app/animations/FadeIn'
import { Heading } from 'grommet'
import { IconContext } from 'phosphor-react'
import { Text } from 'grommet'
import { cpTheme } from '@cambrian/app/theme/theme'

interface USPListItemProps {
    title: string | JSX.Element
    description: string
    icon?: JSX.Element
}

const USPListItem = ({ title, description, icon }: USPListItemProps) => {
    return (
        <Box direction="row" pad={{ vertical: 'medium' }} align="center" wrap>
            <Box flex width={{ min: 'medium' }}>
                <FadeIn direction="X" distance="-5%">
                    <Box
                        pad="medium"
                        direction="row"
                        gap="medium"
                        align="center"
                    >
                        <IconContext.Provider
                            value={{
                                size: '32px',
                                color: cpTheme.global.colors['brand'].dark,
                            }}
                        >
                            {icon}
                        </IconContext.Provider>
                        {typeof title === 'string' ? (
                            <Heading level="2">{title}</Heading>
                        ) : (
                            title
                        )}
                    </Box>
                </FadeIn>
            </Box>
            <Box width={{ max: 'medium' }} pad="medium">
                <FadeIn direction="X" distance="5%">
                    <Text color="dark-4">{description}</Text>
                </FadeIn>
            </Box>
        </Box>
    )
}

export default USPListItem
