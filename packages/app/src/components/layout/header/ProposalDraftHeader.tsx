import { Box, Button, Heading, ResponsiveContext, Stack, Text } from 'grommet'
import { ClipboardText, IconContext, TreeStructure } from 'phosphor-react'

import BaseLayerModal from '../../modals/BaseLayerModal'
import StatusBadge from '../../badges/StatusBadge'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useState } from 'react'

interface ProposalDraftHeaderProps {
    title: string
}

// TODO WIP
const ProposalDraftHeader = ({ title }: ProposalDraftHeaderProps) => {
    const [showCompositionInfoModal, setShowCompositionInfoModal] =
        useState(false)

    const toggleShowCompositionInfoModal = () =>
        setShowCompositionInfoModal(!showCompositionInfoModal)

    const [showTemplateInfoModal, setShowTemplateInfoModal] = useState(false)

    const toggleShowTemplateInfoModal = () =>
        setShowTemplateInfoModal(!showTemplateInfoModal)

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
                                                    Proposal
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
                                                            ? 'Template'
                                                            : undefined
                                                    }
                                                    icon={
                                                        <ClipboardText
                                                            color={
                                                                cpTheme.global
                                                                    .colors[
                                                                    'dark-4'
                                                                ]
                                                            }
                                                        />
                                                    }
                                                    onClick={
                                                        toggleShowTemplateInfoModal
                                                    }
                                                />
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
                                        status={'Draft'}
                                        background={'grey'}
                                        tipContent={`This template has not been send to the Seller.`}
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

export default ProposalDraftHeader
