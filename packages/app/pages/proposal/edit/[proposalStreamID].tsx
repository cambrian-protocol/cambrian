import { Box, Heading, Stack, Tab, Tabs, Text } from 'grommet'

import Custom404Page from 'packages/app/pages/404'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import ProposalDescriptionForm from '@cambrian/app/ui/proposals/forms/ProposalDescriptionForm'
import ProposalFlexInputsForm from '@cambrian/app/ui/proposals/forms/ProposalFlexInputsForm'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import ProposalPricingForm from '@cambrian/app/ui/proposals/forms/ProposalPricingForm'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalSubmitControl from '@cambrian/app/ui/proposals/control/ProposalSubmitControl'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import useEditProposal from '@cambrian/app/hooks/useEditProposal'
import { useState } from 'react'

export default function EditProposalPage() {
    const { currentUser } = useCurrentUserContext()

    const {
        stageStack,
        proposalStatus,
        proposalInput,
        setProposalInput,
        onSaveProposal,
        onResetProposalInput,
        proposalStreamID,
        isValidProposal,
        errorMessage,
        setErrorMessage,
        isLoaded,
    } = useEditProposal()

    const [activeIndex, setActiveIndex] = useState(0)

    const isEditable =
        proposalStatus === ProposalStatus.Draft ||
        proposalStatus === ProposalStatus.ChangeRequested ||
        proposalStatus === ProposalStatus.Modified

    const handleSave = async () => {
        await onSaveProposal()
    }

    console.log(stageStack)

    return (
        <>
            {!isLoaded ? (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            ) : proposalInput && isEditable && stageStack ? (
                <Stack anchor="bottom-right">
                    <PageLayout contextTitle={'Edit Proposal'} kind="narrow">
                        <Box gap="medium">
                            <ProposalHeader
                                proposalStatus={proposalStatus}
                                stageStack={stageStack}
                            />
                            <Tabs
                                justify="start"
                                activeIndex={activeIndex}
                                onActive={(nextIndex: number) =>
                                    setActiveIndex(nextIndex)
                                }
                            >
                                <Tab title="Description">
                                    <Box pad={{ top: 'medium' }} gap="medium">
                                        <Box pad="xsmall">
                                            <HeaderTextSection
                                                size="small"
                                                title={`Provide us with details about the project`}
                                                paragraph={
                                                    'Please be sure to include information requested by the Template description.'
                                                }
                                            />
                                            {stageStack.template.requirements.trim() !==
                                                '' && (
                                                <Box gap="xsmall">
                                                    <Heading level="4">
                                                        Requirements
                                                    </Heading>
                                                    <Text
                                                        color="dark-4"
                                                        style={{
                                                            whiteSpace:
                                                                'pre-line',
                                                        }}
                                                    >
                                                        {
                                                            stageStack.template
                                                                .requirements
                                                        }
                                                    </Text>
                                                </Box>
                                            )}
                                        </Box>
                                        <ProposalDescriptionForm
                                            proposalInput={proposalInput}
                                            setProposalInput={setProposalInput}
                                            onSubmit={handleSave}
                                            onCancel={onResetProposalInput}
                                        />
                                    </Box>
                                </Tab>
                                <Tab title="Pricing">
                                    <Box pad={{ top: 'medium' }}>
                                        <Box pad="xsmall">
                                            <HeaderTextSection
                                                size="small"
                                                title="How much are you willing to pay?"
                                            />
                                        </Box>
                                        <ProposalPricingForm
                                            template={stageStack.template}
                                            proposalInput={proposalInput}
                                            setProposalInput={setProposalInput}
                                            onSubmit={handleSave}
                                            onCancel={onResetProposalInput}
                                        />
                                    </Box>
                                </Tab>
                                {proposalInput.flexInputs.length > 0 && (
                                    <Tab title="Solver Config">
                                        <Box pad={{ top: 'medium' }}>
                                            <Box pad="xsmall">
                                                <HeaderTextSection
                                                    title="Solver Configuration"
                                                    paragraph="Please input the following information to set up the Solver correctly."
                                                    size="small"
                                                />
                                            </Box>
                                            <ProposalFlexInputsForm
                                                composition={
                                                    stageStack.composition
                                                }
                                                proposalInput={proposalInput}
                                                setProposalInput={
                                                    setProposalInput
                                                }
                                                onSubmit={handleSave}
                                                onCancel={onResetProposalInput}
                                            />
                                        </Box>
                                    </Tab>
                                )}
                            </Tabs>
                            <PlainSectionDivider />
                            <ProposalSubmitControl
                                onSave={onSaveProposal}
                                proposalStreamID={proposalStreamID}
                                isValidProposal={isValidProposal}
                            />
                        </Box>
                    </PageLayout>
                    {proposalStatus !== ProposalStatus.Draft && currentUser && (
                        <Messenger
                            currentUser={currentUser}
                            chatID={proposalStreamID}
                            participantDIDs={[
                                stageStack.template.author,
                                stageStack.proposal.author,
                            ]}
                        />
                    )}
                </Stack>
            ) : (
                <Custom404Page />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}
