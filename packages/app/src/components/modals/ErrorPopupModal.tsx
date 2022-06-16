import { Box, Heading, Layer, Text } from 'grommet'
import { Warning, X } from 'phosphor-react'

import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'

interface ErrorPopupModalProps {
    onClose: () => void
    errorMessage: ErrorMessageType
}

const ErrorPopupModal = ({ onClose, errorMessage }: ErrorPopupModalProps) => {
    return (
        <Layer
            onEsc={onClose}
            background={'background-contrast'}
            responsive={false}
        >
            <Box width="medium" border round="xsmall">
                <Box direction="row" elevation="small">
                    <Box onClick={onClose} pad="small" focusIndicator={false}>
                        <X size={'24'} />
                    </Box>
                    <Box flex />
                </Box>
                <Box
                    pad="medium"
                    gap="small"
                    align="center"
                    height="small"
                    justify="center"
                >
                    <Warning size="48" />
                    <Heading level="3" textAlign="center">
                        {errorMessage.title}
                    </Heading>
                    <Text size="small" color="dark-4">
                        {errorMessage.message}
                    </Text>
                </Box>
            </Box>
        </Layer>
    )
}

export default ErrorPopupModal
