import { Box, Heading, Text } from 'grommet'

import BaseInfoItem from '../BaseInfoItem'
import ModalHeader from '../../layout/header/ModalHeader'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import OutcomeOverview from '@cambrian/app/ui/solver/OutcomeOverview'
import { PropsWithChildren } from 'react'
import RecipientInfoItem from '../RecipientInfo'
import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import SolverConfigItem from '../../list/SolverConfigItem'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import TokenAvatar from '../../avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'

type BaseSolverInfoProps = PropsWithChildren<{}> & {
    solverTag?: SolverTagModel
    slotTags?: SlotTagsHashMapType
    keeper: string
    arbitrator?: string
    outcomeCollections?: OutcomeCollectionModel[]
    token?: TokenModel
}

// TODO display if token is still flexible and preferred alternative tokens
const BaseSolverInfo = ({
    solverTag,
    outcomeCollections,
    keeper,
    arbitrator,
    slotTags,
    token,
    children,
}: BaseSolverInfoProps) => {
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
                    {arbitrator && (
                        <SolverConfigItem
                            id="arbitrator"
                            slotTags={slotTags}
                            value={<RecipientInfoItem address={arbitrator} />}
                        />
                    )}
                    <SolverConfigItem
                        id="collateralToken"
                        slotTags={slotTags}
                        value={
                            <BaseInfoItem
                                icon={<TokenAvatar token={token} />}
                                title={token?.name || 'Unknown'}
                                subTitle={token?.symbol || 'Unknown'}
                            />
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
