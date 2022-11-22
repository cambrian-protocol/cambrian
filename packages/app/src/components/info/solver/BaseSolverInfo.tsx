import { Box, Heading, Text } from 'grommet'
import { PropsWithChildren, useEffect, useState } from 'react'

import BaseTokenItem from '../../token/BaseTokenItem'
import ModalHeader from '../../layout/header/ModalHeader'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import OutcomeOverview from '@cambrian/app/ui/solver/OutcomeOverview'
import RecipientInfoItem from '../RecipientInfo'
import { SlotTagsHashMapType } from '@cambrian/app/src/classes/Tags/SlotTag'
import SolverConfigItem from '../../list/SolverConfigItem'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { getArbitratorAddressOrOwner } from '@cambrian/app/utils/helpers/arbitratorHelper'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

type BaseSolverInfoProps = PropsWithChildren<{}> & {
    solverTag?: SolverTagModel
    slotTags?: SlotTagsHashMapType
    keeper: string
    arbitrator?: string
    outcomeCollections?: OutcomeCollectionModel[]
    token?: TokenModel
}

const BaseSolverInfo = ({
    solverTag,
    outcomeCollections,
    keeper,
    arbitrator,
    slotTags,
    token,
    children,
}: BaseSolverInfoProps) => {
    const { currentUser } = useCurrentUserContext()
    const [arbitratorAddress, setArbitratorAddress] = useState()

    const hasArbitrator =
        (slotTags &&
            slotTags['arbitrator']?.isFlex &&
            slotTags['arbitrator'].isFlex != 'None') ||
        (arbitrator && arbitrator.length > 0)

    useEffect(() => {
        if (currentUser && hasArbitrator) initArbitrator(currentUser)
    }, [currentUser])

    const initArbitrator = async (user: UserType) => {
        if (arbitrator) {
            setArbitratorAddress(
                await getArbitratorAddressOrOwner(arbitrator, user)
            )
        }
    }

    return (
        <>
            <Box pad={{ horizontal: 'medium' }}>
                <ModalHeader
                    title={solverTag?.title || 'Untitled Solver'}
                    metaInfo={'Solver Configuration'}
                    description={solverTag?.description}
                />
                <Box gap="medium" height={{ min: 'auto' }}>
                    <SolverConfigItem
                        id="keeper"
                        slotTags={slotTags}
                        value={<RecipientInfoItem address={keeper} />}
                    />
                    {hasArbitrator && (
                        <SolverConfigItem
                            id="arbitrator"
                            slotTags={slotTags}
                            value={
                                <RecipientInfoItem
                                    address={arbitratorAddress}
                                />
                            }
                        />
                    )}
                    <SolverConfigItem
                        id="collateralToken"
                        slotTags={slotTags}
                        value={
                            <Box align="start">
                                <BaseTokenItem tokenAddress={token?.address} />
                            </Box>
                        }
                    />
                    {children}
                </Box>
                <Box
                    pad={{ top: 'medium', bottom: 'xlarge' }}
                    height={{ min: 'auto' }}
                    gap="medium"
                >
                    <Box width="medium">
                        <Heading level="4">Outcome Overview</Heading>
                        <Text color="dark-4" size="xsmall">
                            Click on the outcome which can occur at this Solver
                            and see the according allocation of the Tokens.
                        </Text>
                    </Box>
                    {outcomeCollections && (
                        <OutcomeOverview
                            collateralToken={token}
                            outcomeCollections={outcomeCollections}
                        />
                    )}
                </Box>
            </Box>
        </>
    )
}

export default BaseSolverInfo
