import { Box, Tab, Tabs } from 'grommet'

import Custom404Page from 'packages/app/pages/404'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalDescriptionForm from './forms/ProposalDescriptionForm'
import ProposalFlexInputsForm from './forms/ProposalFlexInputsForm'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import ProposalPricingForm from './forms/ProposalPricingForm'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalSubmitControl from '@cambrian/app/components/bars/sidebar/proposal/ProposalSubmitControl'
import useEditProposal from '@cambrian/app/hooks/useEditProposal'
import { useState } from 'react'

const EditProposalUI = () => {
    const {
        proposalStack,
        proposalStatus,
        proposalInput,
        setProposalInput,
        onSaveProposal,
        onResetProposalInput,
    } = useEditProposal()
    const [activeIndex, setActiveIndex] = useState(0)

    const isEditable =
        proposalStatus === ProposalStatus.Draft ||
        proposalStatus === ProposalStatus.ChangeRequested ||
        proposalStatus === ProposalStatus.Modified

    return (
        <>
            {!proposalStack ? (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            ) : proposalInput && isEditable ? (
                <PageLayout contextTitle={'Edit Proposal'} kind="narrow">
                    <Box pad="large" gap="medium">
                        <ProposalHeader
                            proposalStatus={proposalStatus}
                            proposalStack={proposalStack}
                        />
                        <ProposalSubmitControl />
                        <Tabs
                            justify="start"
                            activeIndex={activeIndex}
                            onActive={(nextIndex: number) =>
                                setActiveIndex(nextIndex)
                            }
                        >
                            <Tab title="Description">
                                <Box pad="small">
                                    <ProposalDescriptionForm
                                        proposalInput={proposalInput}
                                        setProposalInput={setProposalInput}
                                        onSubmit={onSaveProposal}
                                        onCancel={onResetProposalInput}
                                    />
                                </Box>
                            </Tab>
                            <Tab title="Pricing">
                                <Box pad="small">
                                    <ProposalPricingForm
                                        template={proposalStack.template}
                                        proposalInput={proposalInput}
                                        setProposalInput={setProposalInput}
                                        onSubmit={onSaveProposal}
                                        onCancel={onResetProposalInput}
                                    />
                                </Box>
                            </Tab>
                            {proposalInput.flexInputs.length > 0 && (
                                <Tab title="Solver Config">
                                    <Box pad="small">
                                        <ProposalFlexInputsForm
                                            composition={
                                                proposalStack.composition
                                            }
                                            proposalInput={proposalInput}
                                            setProposalInput={setProposalInput}
                                            onSubmit={onSaveProposal}
                                            onCancel={onResetProposalInput}
                                        />
                                    </Box>
                                </Tab>
                            )}
                        </Tabs>
                    </Box>
                </PageLayout>
            ) : (
                <Custom404Page />
            )}
        </>
    )
}

export default EditProposalUI
