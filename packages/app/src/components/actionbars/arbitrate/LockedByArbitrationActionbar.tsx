import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import BaseActionbar from '@cambrian/app/components/actionbars/BaseActionbar'
import { Scales } from 'phosphor-react'

const LockedByArbitrationActionbar = () => (
    <BaseActionbar
        info={{
            title: 'Arbitration in Progress',
            subTitle:
                'Somebody has disagreed with the proposed outcome, please reach out to the Arbitrator for more information',
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
