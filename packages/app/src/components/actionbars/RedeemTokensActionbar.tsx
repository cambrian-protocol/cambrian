import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { Handshake } from 'phosphor-react'

interface RedeemTokensActionbarProps {}

const RedeemTokensActionbar = ({}: RedeemTokensActionbarProps) => {
    // TODO Fetch token and amount for signer
    // TODO Redeem token functionality
    return (
        <Actionbar
            actions={{
                primaryAction: {
                    onClick: () => {},
                    label: 'Redeem tokens',
                },
                info: {
                    icon: <Handshake />,
                    label: '0.2 ETH',
                    descLabel: 'You have earned',
                },
            }}
        />
    )
}

export default RedeemTokensActionbar
