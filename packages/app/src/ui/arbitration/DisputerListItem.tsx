import { AccordionPanel, Box } from 'grommet'
import { useEffect, useState } from 'react'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import { OutcomeCollectionInfoType } from '@cambrian/app/components/info/solver/BaseSolverInfo'
import OutcomePreview from '../solver/OutcomePreview'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Text } from 'grommet'
import { ethers } from 'ethers'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { getOutcomeCollectionInfoFromContractData } from '@cambrian/app/utils/helpers/solverHelpers'

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
    const [outcomeCollectionInfo, setOutcomeCollectionInfo] =
        useState<OutcomeCollectionInfoType>()

    useEffect(() => {
        const indexSet = getIndexSetFromBinaryArray(choice)

        const outcomeCollection = solverData.outcomeCollections[
            currentCondition.conditionId
        ].find((outcomeCollection) => outcomeCollection.indexSet === indexSet)

        if (
            outcomeCollection &&
            solverData.numMintedTokensByCondition &&
            solverData.numMintedTokensByCondition[currentCondition.conditionId]
        ) {
            const outcomeCollectionInfo =
                getOutcomeCollectionInfoFromContractData(
                    outcomeCollection,
                    Number(
                        ethers.utils.formatUnits(
                            solverData.numMintedTokensByCondition[
                                currentCondition.conditionId
                            ],
                            solverData.collateralToken.decimals
                        )
                    )
                )

            setOutcomeCollectionInfo(outcomeCollectionInfo)
        }
    }, [])

    return (
        <>
            {outcomeCollectionInfo && (
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
                            outcome={outcomeCollectionInfo}
                            collateralToken={solverData.collateralToken}
                        />
                    </Box>
                </AccordionPanel>
            )}
        </>
    )
}

export default DisputerListItem
