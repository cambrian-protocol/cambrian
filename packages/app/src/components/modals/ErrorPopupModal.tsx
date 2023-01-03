import { Heading, Text } from 'grommet'

import BasePopupModal from './BasePopupModal'
import { CambrianErrorType } from '@cambrian/app/constants/ErrorMessages'
import { Warning } from 'phosphor-react'

interface ErrorPopupModalProps {
    onClose: () => void
    cambrianError: CambrianErrorType
}

const ErrorPopupModal = ({ onClose, cambrianError }: ErrorPopupModalProps) => {
    return (
        <BasePopupModal onClose={onClose}>
            <Warning size="48" />
            <Heading level="3" textAlign="center">
                {cambrianError.title}
            </Heading>
            <Text size="small" color="dark-4" textAlign="center">
                {cambrianError.message}
            </Text>
        </BasePopupModal>
    )
}

export default ErrorPopupModal
