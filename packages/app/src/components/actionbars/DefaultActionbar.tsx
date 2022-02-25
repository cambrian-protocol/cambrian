import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { WarningCircle } from 'phosphor-react'

const DefaultActionbar = () => {
    return (
        <Actionbar
            actions={{
                info: {
                    label: 'Please connect the right wallet',
                    descLabel: 'No functions available',
                    icon: <WarningCircle />,
                },
            }}
        />
    )
}

export default DefaultActionbar
