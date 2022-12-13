import Custom404Page from 'packages/app/pages/404'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import ProposalActionbar from '@cambrian/app/components/bars/actionbars/proposal/ProposalActionbar'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import ProposalPreview from './ProposalPreview'
import ProposalSkeleton from '@cambrian/app/components/skeletons/ProposalSkeleton'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { UserType } from '@cambrian/app/store/UserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalUIProps {
    currentUser: UserType
}

const ProposalUI = ({ currentUser }: ProposalUIProps) => {
    const { isLoaded, stageStack, proposalStatus, collateralToken } =
        useProposalContext()

    const isTemplateOrProposalAuthor =
        currentUser.did === stageStack?.template.author ||
        currentUser.did === stageStack?.proposal.author

    const initMessenger =
        isTemplateOrProposalAuthor && proposalStatus !== ProposalStatus.Draft

    return (
        <>
            {isLoaded && stageStack === undefined ? (
                <Custom404Page />
            ) : (
                <InteractionLayout
                    contextTitle={stageStack?.proposal.title || 'Proposal'}
                    header={
                        stageStack && (
                            <ProposalHeader
                                collateralToken={collateralToken}
                                stageStack={stageStack}
                                proposalStatus={proposalStatus}
                                showConfiguration
                            />
                        )
                    }
                    actionBar={
                        <ProposalActionbar
                            proposedPrice={{
                                amount: stageStack?.proposal.price.amount || '',
                                token: collateralToken,
                            }}
                            messenger={
                                initMessenger && stageStack ? (
                                    <Messenger
                                        chatID={stageStack.proposalStreamID}
                                        currentUser={currentUser}
                                        participantDIDs={[
                                            stageStack.proposal.author,
                                            stageStack.template.author,
                                        ]}
                                    />
                                ) : undefined
                            }
                        />
                    }
                >
                    {stageStack ? (
                        <ProposalPreview
                            showConfiguration
                            stageStack={stageStack}
                            collateralToken={collateralToken}
                            proposalStatus={proposalStatus}
                        />
                    ) : (
                        <ProposalSkeleton />
                    )}
                </InteractionLayout>
            )}
        </>
    )
}

export default ProposalUI
