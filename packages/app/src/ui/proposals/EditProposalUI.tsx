import { Box, Tab, Tabs } from 'grommet'
import { useContext, useEffect, useState } from 'react'

import Custom404Page from 'packages/app/pages/404'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalDescriptionForm from './forms/ProposalDescriptionForm'
import ProposalEditSidebar from '@cambrian/app/components/bars/sidebar/proposal/ProposalEditSidebar'
import ProposalFlexInputsForm from './forms/ProposalFlexInputsForm'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import ProposalPricingForm from './forms/ProposalPricingForm'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { useProposal } from '@cambrian/app/hooks/useProposal'

const EditProposalUI = () => {
    const { proposalStatus, proposalInput, isLoaded } = useProposal()
    const [activeIndex, setActiveIndex] = useState(0)

    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeIndex])

    const isEditable =
        proposalStatus === ProposalStatus.Draft ||
        proposalStatus === ProposalStatus.ChangeRequested

    return (
        <>
            {!isLoaded ? (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            ) : proposalInput && isEditable ? (
                <InteractionLayout
                    contextTitle={'Edit Proposal'}
                    proposalHeader={<ProposalHeader />}
                    sidebar={<ProposalEditSidebar />}
                >
                    <Tabs
                        justify="start"
                        activeIndex={activeIndex}
                        onActive={(nextIndex: number) =>
                            setActiveIndex(nextIndex)
                        }
                    >
                        <Tab title="Description">
                            <Box pad="small">
                                <ProposalDescriptionForm />
                            </Box>
                        </Tab>
                        <Tab title="Pricing">
                            <Box pad="small">
                                <ProposalPricingForm />
                            </Box>
                        </Tab>
                        {proposalInput.flexInputs.length > 0 && (
                            <Tab title="Solver Config">
                                <Box pad="small">
                                    <ProposalFlexInputsForm />
                                </Box>
                            </Tab>
                        )}
                    </Tabs>
                </InteractionLayout>
            ) : (
                <Custom404Page />
            )}
        </>
    )
}

export default EditProposalUI
