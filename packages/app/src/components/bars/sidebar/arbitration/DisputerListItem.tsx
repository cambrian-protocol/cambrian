import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import { Box } from 'grommet'
import { CardHeader } from 'grommet'
import OutcomeCollectionCard from '@cambrian/app/components/cards/OutcomeCollectionCard'
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
                <Box
                    background={'background-contrast-hover'}
                    round="xsmall"
                    elevation="small"
                >
                    <OutcomeCollectionCard
                        cardHeader={
                            <CardHeader
                                pad="small"
                                elevation="small"
                                direction="row"
                                gap="small"
                                justify="start"
                            >
                                <BaseAvatar address={address} />
                                <Text truncate>
                                    {recipient?.tag.label}'s choice
                                </Text>
                            </CardHeader>
                        }
                        outcomeCollection={outcomeCollection}
                        token={solverData.collateralToken}
                    />
                </Box>
            )}
        </>
    )
}

export default DisputerListItem
