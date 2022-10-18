import { Faders, TreeStructure, UsersThree } from 'phosphor-react'
import { PropsWithChildren, useState } from 'react'
import RecipientInfosModal, {
    RecipientInfoType,
} from '@cambrian/app/ui/common/modals/RecipientInfosModal'

import BaseListItemButton from '../../buttons/BaseListItemButton'
import ModalHeader from '../../layout/header/ModalHeader'
import OutcomeCollectionInfosModal from '@cambrian/app/ui/common/modals/OutcomeCollectionInfosModal'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'

type BaseSolverInfoProps = PropsWithChildren<{}> & {
    solverTag?: SolverTagModel
    /*  keeper: RecipientInfoType */
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
    children,
    token,
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
            <ModalHeader
                title={solverTag?.title || 'Untitled Solver'}
                icon={<Faders />}
                metaInfo={'Solver Configuration'}
                description={solverTag?.description}
            />
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
            {/* <BaseListItemButton
                info={
                    composerSolver.slotTags
                        ? composerSolver.slotTags['arbitrator']?.description
                        : undefined
                }
                title="Arbitrator"
                icon={
                    <BaseAvatar
                        address={composerSolver.config.arbitratorAddress}
                    />
                }
                subTitle={composerSolver.config.arbitratorAddress}
            /> */}
            {children}
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
