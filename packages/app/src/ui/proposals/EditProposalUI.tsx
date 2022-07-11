import { Box, Heading, Tab, Tabs, Text } from 'grommet'
import { SetStateAction, useContext, useEffect, useState } from 'react'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ProposalDescriptionForm from './forms/ProposalDescriptionForm'
import ProposalFlexInputsForm from './forms/ProposalFlexInputsForm'
import ProposalPricingForm from './forms/ProposalPricingForm'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { UserType } from '@cambrian/app/store/UserContext'

interface EditProposalUIProps {
    currentUser: UserType
    proposalInput: CeramicProposalModel
    composition: CompositionModel
    template: CeramicTemplateModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    onSaveProposal: () => Promise<void>
    onResetProposal: () => void
    proposalStatus: ProposalStatus
}

const EditProposalUI = ({
    currentUser,
    proposalInput,
    setProposalInput,
    onSaveProposal,
    template,
    composition,
    onResetProposal,
    proposalStatus,
}: EditProposalUIProps) => {
    const [activeIndex, setActiveIndex] = useState(0)
    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeIndex])

    return (
        <>
            {proposalStatus === ProposalStatus.OnReview ||
            proposalStatus === ProposalStatus.Approved ? (
                <>
                    <Heading>TODO Proposal Plain readonly view</Heading>
                    <Text>{proposalInput?.description}</Text>
                </>
            ) : (
                <Tabs
                    justify="start"
                    activeIndex={activeIndex}
                    onActive={(nextIndex: number) => setActiveIndex(nextIndex)}
                >
                    <Tab title="Description">
                        <Box pad="small">
                            <ProposalDescriptionForm
                                proposalInput={proposalInput}
                                setProposalInput={setProposalInput}
                                onSubmit={onSaveProposal}
                                onCancel={onResetProposal}
                            />
                        </Box>
                    </Tab>
                    <Tab title="Pricing">
                        <Box pad="small">
                            <ProposalPricingForm
                                proposalInput={proposalInput}
                                setProposalInput={setProposalInput}
                                onSubmit={onSaveProposal}
                                onCancel={onResetProposal}
                                currentUser={currentUser}
                                template={template}
                            />
                        </Box>
                    </Tab>
                    {proposalInput.flexInputs.length > 0 && (
                        <Tab title="Solver Config">
                            <Box pad="small">
                                <ProposalFlexInputsForm
                                    proposalInput={proposalInput}
                                    setProposalInput={setProposalInput}
                                    onSubmit={onSaveProposal}
                                    onCancel={onResetProposal}
                                    composition={composition}
                                />
                            </Box>
                        </Tab>
                    )}
                </Tabs>
            )}
        </>
    )
}

export default EditProposalUI
