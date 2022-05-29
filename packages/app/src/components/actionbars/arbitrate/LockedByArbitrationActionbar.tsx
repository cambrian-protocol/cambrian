import { Question, Scales } from 'phosphor-react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'

interface LockedByArbitrationActionbarProps {
    metadata?: MetadataModel
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const LockedByArbitrationActionbar = ({
    solverData,
    metadata,
    currentCondition,
}: LockedByArbitrationActionbarProps) => (
    <Actionbar
        actionbarItems={[
            {
                icon: <Question />,
                dropContent: (
                    <ActionbarItemDropContainer
                        title="Arbitration in Progress"
                        description="Somebody has disagreed with the proposed outcome and raised a dispute"
                        list={[
                            {
                                icon: <Scales />,
                                label: 'Please reach out to the Arbitrator for more Information',
                            },
                        ]}
                    />
                ),
                label: 'Help',
            },
        ]}
        metadata={metadata}
        solverData={solverData}
        currentCondition={currentCondition}
    />
)

export default LockedByArbitrationActionbar
