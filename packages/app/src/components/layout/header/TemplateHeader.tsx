import { Box, Button, Heading, ResponsiveContext, Stack, Text } from 'grommet'
import { IconContext, TreeStructure } from 'phosphor-react'

import BaseLayerModal from '../../modals/BaseLayerModal'
import StatusBadge from '../../badges/StatusBadge'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useState } from 'react'

interface TemplateHeaderProps {
    title: string
}

// TODO WIP
const TemplateHeader = ({ title }: TemplateHeaderProps) => {
    const [showCompositionInfoModal, setShowCompositionInfoModal] =
        useState(false)

    const toggleShowCompositionInfoModal = () =>
        setShowCompositionInfoModal(!showCompositionInfoModal)

    return (
        <>
            <IconContext.Provider value={{ size: '24' }}>
                <ResponsiveContext.Consumer>
                    {(screenSize) => {
                        return (
                            <Box width="xlarge">
                                <Stack anchor="top-right">
                                    <Box pad={{ top: 'medium' }}>
                                        <Box
                                            direction="row"
                                            justify="between"
                                            align="center"
                                            pad={{
                                                vertical: 'small',
                                                horizontal: 'medium',
                                            }}
                                            border
                                            round="xsmall"
                                        >
                                            <Box>
                                                <Text
                                                    size="small"
                                                    color="dark-4"
                                                >
                                                    Template
                                                </Text>
                                                <Heading level="3">
                                                    {title}
                                                </Heading>
                                            </Box>
                                            <Box
                                                direction="row"
                                                gap="small"
                                                alignSelf="end"
                                                pad={{ top: 'large' }}
                                            >
                                                <Button
                                                    disabled
                                                    color="dark-4"
                                                    size="small"
                                                    label={
                                                        screenSize !== 'small'
                                                            ? 'Composition'
                                                            : undefined
                                                    }
                                                    icon={
                                                        <TreeStructure
                                                            color={
                                                                cpTheme.global
                                                                    .colors[
                                                                    'dark-4'
                                                                ]
                                                            }
                                                        />
                                                    }
                                                    onClick={
                                                        toggleShowCompositionInfoModal
                                                    }
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <StatusBadge
                                        status={'Private'}
                                        background={'green'}
                                        tipContent={`This template has not been published to the Marketplace yet.`}
                                    />
                                </Stack>
                            </Box>
                        )
                    }}
                </ResponsiveContext.Consumer>
            </IconContext.Provider>
            {showCompositionInfoModal && (
                <BaseLayerModal
                    onClose={toggleShowCompositionInfoModal}
                ></BaseLayerModal>
            )}
        </>
    )
}

export default TemplateHeader
