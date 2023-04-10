import { Box, Button, Heading, Stack, Tab, Tabs, Text } from 'grommet'
import { FloppyDisk, PaperPlaneRight } from 'phosphor-react'
import React, { useEffect, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import ProposalDescriptionForm from './forms/ProposalDescriptionForm'
import ProposalFlexInputsForm from './forms/ProposalFlexInputsForm'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalPricingForm from './forms/ProposalPricingForm'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import _ from 'lodash'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'
import { useRouter } from 'next/router'

export type ProposalInputType = Pick<
    ProposalModel,
    'title' | 'description' | 'flexInputs' | 'price'
>

export const initialProposalInput: ProposalInputType = {
    title: '',
    description: '',
    flexInputs: [],
    price: { amount: '', tokenAddress: '' },
}

const EditProposalUI = () => {
    const router = useRouter()
    const { currentUser } = useCurrentUserContext()
    const { proposal } = useProposalContext()
    const [activeIndex, setActiveIndex] = useState(0)
    const [isSaving, setIsSaving] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDisabled, setIsDisabled] = useState(true)

    const [proposalInput, setProposalInput] =
        useState<ProposalInputType>(initialProposalInput)

    useEffect(() => {
        if (proposal) {
            setProposalInput({
                title: proposal.content.title,
                description: proposal.content.description,
                flexInputs: proposal.content.flexInputs,
                price: proposal.content.price,
            })

            setIsDisabled(
                proposal.status !== ProposalStatus.Draft &&
                    proposal.status !== ProposalStatus.ChangeRequested &&
                    proposal.status !== ProposalStatus.Modified
            )
        }
    }, [proposal])

    const onSave = async () => {
        if (proposal) {
            try {
                setIsSaving(true)
                const updatedProposal = {
                    ...proposal.content,
                    ...proposalInput,
                }
                if (!_.isEqual(updatedProposal, proposal.content)) {
                    await proposal.updateContent(updatedProposal)
                }
                setIsSaving(false)
            } catch (e) {
                console.error(e)
            }
        }
    }

    const onSubmit = async () => {
        if (proposal) {
            try {
                setIsSubmitting(true)
                const updatedProposal = {
                    ...proposal.content,
                    ...proposalInput,
                }
                if (!_.isEqual(updatedProposal, proposal.content)) {
                    await proposal.updateContent(updatedProposal)
                }

                await proposal.submit()
                router.push(
                    `${window.location.origin}/solver/${proposal.doc.streamID}`
                )
            } catch (e) {
                console.error(e)
                setIsSubmitting(false)
            }
        }
    }

    return (
        <>
            {proposal ? (
                <Stack anchor="bottom-right">
                    <PageLayout contextTitle={'Edit Proposal'}>
                        <Box align="center">
                            <Box width="xlarge" gap="medium">
                                <ProposalHeader proposal={proposal} />
                                <Tabs
                                    justify="start"
                                    activeIndex={activeIndex}
                                    onActive={(nextIndex: number) =>
                                        setActiveIndex(nextIndex)
                                    }
                                >
                                    <Tab title="Description">
                                        <Box
                                            pad={{ top: 'medium' }}
                                            gap="medium"
                                        >
                                            <HeaderTextSection
                                                size="small"
                                                title={`Provide us with details about the project`}
                                                paragraph={
                                                    'Please be sure to include information requested by the Template description.'
                                                }
                                            />
                                            {proposal.templateCommitDoc.content.requirements.trim() !==
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
                                                            proposal
                                                                .templateCommitDoc
                                                                .content
                                                                .requirements
                                                        }
                                                    </Text>
                                                </Box>
                                            )}
                                        </Box>
                                        <ProposalDescriptionForm
                                            disabled={isDisabled}
                                            proposalInput={proposalInput}
                                            setProposalInput={setProposalInput}
                                        />
                                    </Tab>
                                    <Tab title="Pricing">
                                        <Box pad={{ top: 'medium' }}>
                                            <HeaderTextSection
                                                size="small"
                                                title="How much are you willing to pay?"
                                            />
                                            <ProposalPricingForm
                                                disabled={isDisabled}
                                                proposal={proposal}
                                                proposalInput={proposalInput}
                                                setProposalInput={
                                                    setProposalInput
                                                }
                                            />
                                        </Box>
                                    </Tab>
                                    {proposal.content.flexInputs.length > 0 && (
                                        <Tab title="Solver Config">
                                            <Box pad={{ top: 'medium' }}>
                                                <HeaderTextSection
                                                    title="Solver Configuration"
                                                    paragraph="Please input the following information to set up the Solver correctly."
                                                    size="small"
                                                />
                                                <ProposalFlexInputsForm
                                                    disabled={isDisabled}
                                                    proposal={proposal}
                                                    proposalInput={
                                                        proposalInput
                                                    }
                                                    setProposalInput={
                                                        setProposalInput
                                                    }
                                                />
                                            </Box>
                                        </Tab>
                                    )}
                                    <Box align="end" justify="center" flex>
                                        <Box direction="row" gap="small">
                                            <LoaderButton
                                                isLoading={isSaving}
                                                disabled={isDisabled}
                                                icon={<FloppyDisk />}
                                                onClick={onSave}
                                            />
                                            <LoaderButton
                                                isLoading={isSubmitting}
                                                disabled={isDisabled}
                                                reverse
                                                secondary
                                                label="Submit"
                                                icon={<PaperPlaneRight />}
                                                onClick={onSubmit}
                                            />
                                        </Box>
                                    </Box>
                                </Tabs>
                            </Box>
                        </Box>
                    </PageLayout>
                    {proposal.status !== ProposalStatus.Draft &&
                        currentUser && (
                            <Messenger
                                currentUser={currentUser}
                                chatID={proposal.doc.streamID}
                                participantDIDs={[
                                    proposal.template.content.author,
                                    proposal.content.author,
                                ]}
                            />
                        )}
                </Stack>
            ) : (
                <PageLayout contextTitle="Loading..." kind="narrow">
                    <Box gap="medium">
                        <BaseSkeletonBox height={'xsmall'} width={'50%'} />
                        <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                        <PlainSectionDivider />
                        <BaseSkeletonBox height={'xsmall'} width={'70%'} />
                        <BaseSkeletonBox height={'medium'} width={'100%'} />
                    </Box>
                </PageLayout>
            )}
        </>
    )
}

export default EditProposalUI
