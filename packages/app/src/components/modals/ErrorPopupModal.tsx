import { Heading, Text } from 'grommet'

import BasePopupModal from './BasePopupModal'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import { Warning } from 'phosphor-react'

interface ErrorPopupModalProps {
    onClose: () => void
    errorMessage: ErrorMessageType
}

const ErrorPopupModal = ({ onClose, errorMessage }: ErrorPopupModalProps) => {
    return (
        <BasePopupModal onClose={onClose}>
            <Warning size="48" />
            <Heading level="3" textAlign="center">
                {errorMessage.title}
            </Heading>
            <Text size="small" color="dark-4" textAlign="center">
                {errorMessage.message}
            </Text>
        </BasePopupModal>
    )
}

export default ErrorPopupModal
