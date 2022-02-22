import { Box, Image, ResponsiveContext } from 'grommet'

import PlainSectionDivider from '../sections/PlainSectionDivider'
import { PropsWithChildren } from 'react'
import UserMenu from './UserMenu'

const SideNav = ({ children }: PropsWithChildren<{}>) => {
    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => (
                <Box
                    height={{ min: 'auto' }}
                    width={{ min: 'auto' }}
                    background="background-front"
                    fill="vertical"
                    justify="between"
                    align="center"
                    pad={{ bottom: 'large', top: 'small' }}
                    round={{ corner: 'right', size: 'small' }}
                    elevation="small"
                    gap="large"
                    margin={{ right: 'small' }}
                >
                    <Box pad={screenSize === 'small' ? 'medium' : 'small'}>
                        <Box width={{ min: 'xxsmall', max: 'xxsmall' }}>
                            <Image src="/images/cambrian_protocol_logo_400x400.png" />
                        </Box>
                    </Box>
                    <Box overflow={{ vertical: 'auto' }} flex gap="medium">
                        {children}
                    </Box>
                    <Box gap="medium" fill="horizontal">
                        <PlainSectionDivider />
                        <UserMenu />
                    </Box>
                </Box>
            )}
        </ResponsiveContext.Consumer>
    )
}

export default SideNav
