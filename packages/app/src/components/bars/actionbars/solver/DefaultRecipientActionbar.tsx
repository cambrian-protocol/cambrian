import BaseActionbar from '../BaseActionbar'

interface DefaultRecipientActionbarProps {
    messenger?: JSX.Element
}

const DefaultRecipientActionbar = ({
    messenger,
}: DefaultRecipientActionbarProps) => <BaseActionbar messenger={messenger} />

export default DefaultRecipientActionbar
