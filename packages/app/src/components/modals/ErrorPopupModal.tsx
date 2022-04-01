import BasePopupModal from './BasePopupModal'

interface ErrorPopupModalProps {
    onClose: () => void
    title?: string
    errorMessage?: string
}

const ErrorPopupModal = ({
    onClose,
    title,
    errorMessage,
}: ErrorPopupModalProps) => (
    <BasePopupModal
        onClose={onClose}
        title={title ? title : 'Something went wrong'}
        description={errorMessage ? errorMessage : 'Please try again later...'}
    />
)

export default ErrorPopupModal
