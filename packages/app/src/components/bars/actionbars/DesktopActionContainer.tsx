import { Box, Heading, Text } from 'grommet'

import { ActionbarProps } from './BaseActionbar'
import PlainSectionDivider from '../../sections/PlainSectionDivider'

const DesktopActionContainer = ({
    info,
    primaryAction,
    secondaryAction,
    messenger,
}: ActionbarProps) => {
    return (
        <>
            {info || primaryAction || secondaryAction ? (
                <Box
                    pad={{
                        left: 'medium',
                        bottom: 'medium',
                    }}
                    gap="small"
                >
                    <Box
                        width={'medium'}
                        border
                        round="xsmall"
                        background="secondary-gradient"
                        pad="small"
                        gap="medium"
                    >
                        {info && (
                            <Box gap="small">
                                <Box>
                                    <Text color="dark-4" size="small">
                                        {info.subTitle}
                                    </Text>
                                    <Heading level="3">{info.title}</Heading>
                                </Box>
                            </Box>
                        )}
                        {(primaryAction || secondaryAction) && (
                            <Box gap="small">
                                {primaryAction && primaryAction}
                                {secondaryAction && secondaryAction}
                            </Box>
                        )}
                        {info?.dropContent && (
                            <Box gap="medium">
                                <PlainSectionDivider />
                                {info.dropContent}
                            </Box>
                        )}
                    </Box>
                </Box>
            ) : null}
            {messenger && (
                <Box
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        right: 0,
                        zIndex: 99,
                    }}
                >
                    {messenger}
                </Box>
            )}
        </>
    )
}

export default DesktopActionContainer
