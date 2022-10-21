import { Box, Heading } from 'grommet'
import {
    Faders,
    HourglassSimpleMedium,
    TreeStructure,
    UsersThree,
} from 'phosphor-react'
import { PropsWithChildren, useState } from 'react'
import RecipientInfosModal, {
    RecipientInfoType,
} from '@cambrian/app/ui/common/modals/RecipientInfosModal'

import BaseAvatar from '../../avatars/BaseAvatar'
import BaseInfoItem from '../BaseInfoItem'
import BaseListItemButton from '../../buttons/BaseListItemButton'
import ModalHeader from '../../layout/header/ModalHeader'
import OutcomeCollectionInfosModal from '@cambrian/app/ui/common/modals/OutcomeCollectionInfosModal'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import RecipientInfoItem from '../RecipientInfo'
import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'
import SolverConfigItem from '../../list/SolverConfigItem'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import TokenAvatar from '../../avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { parseSecondsToDisplay } from '@cambrian/app/utils/helpers/timeParsing'

type BaseSolverInfoProps = PropsWithChildren<{}> & {
    solverTag?: SolverTagModel
    slotTags?: SlotTagsHashMapType
    keeper: string
    timelockSeconds?: number
    arbitrator?: string
    outcomeCollections?: OutcomeCollectionInfoType[]
    token?: TokenModel
}

export type OutcomeCollectionInfoType = {
    outcomes: OutcomeModel[]
    recipientAllocations: RecipientAllocationInfoType[]
}

export type RecipientAllocationInfoType = {
    recipient: RecipientInfoType
    allocation: { percentage: string; amount: number }
}

const BaseSolverInfo = ({
    solverTag,
    outcomeCollections,
    keeper,
    arbitrator,
    slotTags,
    token,
    timelockSeconds,
}: BaseSolverInfoProps) => {
    const [showRecipientsModal, setShowRecipientsModal] = useState(false)
    const [showOutcomeCollectionsModal, setShowOutcomeCollectionsModal] =
        useState(false)

    const toggleShowOutcomeCollectionsModal = () =>
        setShowOutcomeCollectionsModal(!showOutcomeCollectionsModal)

    const toggleShowRecipientsModal = () =>
        setShowRecipientsModal(!showRecipientsModal)

    return (
        <>
            <Box pad={{ horizontal: 'medium' }}>
                <ModalHeader
                    title={solverTag?.title || 'Untitled Solver'}
                    icon={<Faders />}
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
                    <SolverConfigItem
                        id="timelockSeconds"
                        slotTags={slotTags}
                        value={
                            <BaseInfoItem
                                icon={
                                    <BaseAvatar
                                        icon={<HourglassSimpleMedium />}
                                    />
                                }
                                title={
                                    slotTags &&
                                    slotTags['timelockSeconds'].isFlex
                                        ? 'To be defined'
                                        : parseSecondsToDisplay(
                                              timelockSeconds || 0
                                          )
                                }
                                subTitle={
                                    slotTags &&
                                    slotTags['timelockSeconds'].isFlex
                                        ? undefined
                                        : 'to raise a dispute'
                                }
                            />
                        }
                    />
                </Box>
                <Box pad={{ top: 'medium' }}>
                    <Heading level="4">Outcome Overview</Heading>
                    {outcomeCollections && (
                        <>
                            <BaseListItemButton
                                hideDivider
                                icon={<UsersThree />}
                                title="Recipients"
                                onClick={toggleShowRecipientsModal}
                            />
                            <BaseListItemButton
                                hideDivider
                                icon={<TreeStructure />}
                                title="Outcomes"
                                onClick={toggleShowOutcomeCollectionsModal}
                            />
                        </>
                    )}
                </Box>
            </Box>
            {showRecipientsModal && outcomeCollections && (
                <RecipientInfosModal
                    onClose={toggleShowRecipientsModal}
                    recipients={outcomeCollections[0]?.recipientAllocations.map(
                        (allocation) => allocation.recipient
                    )}
                />
            )}
            {showOutcomeCollectionsModal && outcomeCollections && (
                <OutcomeCollectionInfosModal
                    token={token}
                    onClose={toggleShowOutcomeCollectionsModal}
                    outcomeCollections={outcomeCollections}
                />
            )}
        </>
    )
}

export default BaseSolverInfo
