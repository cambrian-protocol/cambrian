import { Box, Button, Heading, Text } from 'grommet'

import BaseLayerModal from '../../modals/BaseLayerModal'
import ClipboardButton from '../../buttons/ClipboardButton'
import { Eye } from 'phosphor-react'
import Link from 'next/link'
import { useState } from 'react'

interface TemplateHeaderProps {
    title: string
    link: string
}

const TemplateHeader = ({ title, link }: TemplateHeaderProps) => {
    const [showCompositionInfoModal, setShowCompositionInfoModal] =
        useState(false)

    const toggleShowCompositionInfoModal = () =>
        setShowCompositionInfoModal(!showCompositionInfoModal)

    return (
        <>
            <Box pad={{ top: 'medium' }}>
                <Box direction="row" justify="between" align="end" wrap>
                    <Box>
                        <Text color="brand">Edit Template</Text>
                        <Heading level="1">{title}</Heading>
                    </Box>
                    <Box direction="row" gap="small" pad={{ top: 'medium' }}>
                        <Link passHref href={link}>
                            <Button icon={<Eye />} />
                        </Link>
                        <ClipboardButton value={link} />
                    </Box>
                </Box>
            </Box>
            {showCompositionInfoModal && (
                <BaseLayerModal
                    onClose={toggleShowCompositionInfoModal}
                ></BaseLayerModal>
            )}
        </>
    )
}

export default TemplateHeader
