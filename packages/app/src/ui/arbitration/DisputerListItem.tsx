import { AccordionPanel, Box } from 'grommet'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import OutcomePreview from '../solver/OutcomePreview'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Text } from 'grommet'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'

interface DisputerListItemProps {
    choice: number[]
    recipient?: RichSlotModel
    address: string
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

// Currently not used, left here for Arbitration UX improvements
const DisputerListItem = ({
    choice,
    recipient,
    address,
    solverData,
    currentCondition,
}: DisputerListItemProps) => {
    const indexSet = getIndexSetFromBinaryArray(choice)

    const outcomeCollection = solverData.outcomeCollections[
        currentCondition.conditionId
    ].find((outcomeCollection) => outcomeCollection.indexSet === indexSet)

    return (
        <>
            {outcomeCollection && (
                <AccordionPanel
                    label={
                        <Box direction="row" align="center" gap="small">
                            <BaseAvatar address={address} />
                            <Text truncate>
                                {recipient?.tag.label}'s choice
                            </Text>
                        </Box>
                    }
                >
                    <Box pad={{ top: 'small' }}>
                        <OutcomePreview
                            outcome={outcomeCollection}
                            collateralToken={solverData.collateralToken}
                        />
                    </Box>
                </AccordionPanel>
            )}
        </>
    )
}

export default DisputerListItem
