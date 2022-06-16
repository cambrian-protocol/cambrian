import { Box, Layer } from 'grommet'
import { Warning, X } from 'phosphor-react'

import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import HeaderTextSection from '../sections/HeaderTextSection'

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
            <Box
                width={{ min: 'auto', max: 'large' }}
                pad="small"
                border
                round="xsmall"
            >
                <Box direction="row">
                    <Box onClick={onClose} pad="small" focusIndicator={false}>
                        <X size={'24'} />
                    </Box>
                    <Box flex />
                </Box>
                <HeaderTextSection
                    size="small"
                    icon={<Warning />}
                    subTitle={
                        errorMessage.code
                            ? `Code: ${errorMessage.code}`
                            : undefined
                    }
                    title={errorMessage.message}
                    paragraph={errorMessage.info}
                />
            </Box>
        </Layer>
    )
}

export default ErrorPopupModal
