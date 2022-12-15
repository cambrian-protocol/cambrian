import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import BaseActionbar from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { Scales } from 'phosphor-react'

interface LockedByArbitrationActionbarProps {
    messenger?: JSX.Element
}

const LockedByArbitrationActionbar = ({
    messenger,
}: LockedByArbitrationActionbarProps) => (
    <BaseActionbar
        messenger={messenger}
        info={{
            title: 'Arbitration in Progress',
            subTitle: 'Somebody has disagreed with the proposed outcome',
            dropContent: (
                <ActionbarItemDropContainer
                    title="Arbitration in Progress"
                    description="Somebody has disagreed with the proposed outcome and raised a dispute."
                    list={[
                        {
                            icon: <Scales />,
                            label: 'Please reach out to the Arbitrator for more information',
                        },
                    ]}
                />
            ),
        }}
    />
)
export default LockedByArbitrationActionbar
