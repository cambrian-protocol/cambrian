import { Box, Heading, Stack, Tab, Tabs, Text } from 'grommet'

import Custom404Page from 'packages/app/pages/404'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import ProposalDescriptionForm from './forms/ProposalDescriptionForm'
import ProposalFlexInputsForm from './forms/ProposalFlexInputsForm'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import ProposalPricingForm from './forms/ProposalPricingForm'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalSubmitControl from '@cambrian/app/components/bars/sidebar/proposal/ProposalSubmitControl'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
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
        proposalStreamDoc,
        isValidProposal,
        errorMessage,
        setErrorMessage
    } = useEditProposal()

    const { currentUser } = useCurrentUser()
    const [activeIndex, setActiveIndex] = useState(0)

    const isEditable =
        proposalStatus === ProposalStatus.Draft ||
        proposalStatus === ProposalStatus.ChangeRequested ||
        proposalStatus === ProposalStatus.Modified

    const handleSubmit = async () => {
        await onSaveProposal()
    }

    return (
        <>
            {!proposalStack ? (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            ) : proposalInput && isEditable && proposalStreamDoc ? (
                <Stack anchor="bottom-right">
                    <PageLayout contextTitle={'Edit Proposal'} kind="narrow">
                        <Box pad="large" gap="medium">
                            <ProposalHeader
                                proposalStatus={proposalStatus}
                                proposalStack={proposalStack}
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
                                            {proposalStack.template.requirements.trim() !==
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
                                                            proposalStack
                                                                .template
                                                                .requirements
                                                        }
                                                    </Text>
                                                </Box>
                                            )}
                                        </Box>
                                        <ProposalDescriptionForm
                                            proposalInput={proposalInput}
                                            setProposalInput={setProposalInput}
                                            onSubmit={handleSubmit}
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
                                            template={proposalStack.template}
                                            proposalInput={proposalInput}
                                            setProposalInput={setProposalInput}
                                            onSubmit={handleSubmit}
                                            onCancel={onResetProposalInput}
                                        />
                                    </Box>
                                </Tab>
                                {proposalInput.flexInputs.length > 0 && (
                                    <Tab title="Solver Config">
                                        <Box pad={{ top: 'medium' }}>
                                            <Box pad="xsmall">
                                                <HeaderTextSection
                                                    title="Solver Configuartion"
                                                    paragraph="Please input the following information to set up the Solver correctly."
                                                    size="small"
                                                />
                                            </Box>
                                            <ProposalFlexInputsForm
                                                composition={
                                                    proposalStack.composition
                                                }
                                                proposalInput={proposalInput}
                                                setProposalInput={
                                                    setProposalInput
                                                }
                                                onSubmit={handleSubmit}
                                                onCancel={onResetProposalInput}
                                            />
                                        </Box>
                                    </Tab>
                                )}
                            </Tabs>
                            <PlainSectionDivider />
                            <ProposalSubmitControl
                                proposalStreamDoc={proposalStreamDoc}
                                isValidProposal={isValidProposal}
                            />
                        </Box>
                    </PageLayout>
                    {proposalStatus !== ProposalStatus.Draft &&
                        currentUser &&
                        proposalStreamDoc && (
                            <Messenger
                                currentUser={currentUser}
                                chatID={proposalStreamDoc.id.toString()}
                                participantDIDs={[
                                    proposalStack.template.author,
                                ]}
                                chatType={'Draft'}
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

export default EditProposalUI
