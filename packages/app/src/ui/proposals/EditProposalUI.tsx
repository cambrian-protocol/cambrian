import { Box, Heading, Stack, Tab, Tabs, Text } from 'grommet'
import React, { useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import ProposalDescriptionForm from './forms/ProposalDescriptionForm'
import ProposalFlexInputsForm from './forms/ProposalFlexInputsForm'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import ProposalPricingForm from './forms/ProposalPricingForm'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalSubmitControl from './control/ProposalSubmitControl'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

const EditProposalUI = () => {
    const { currentUser } = useCurrentUserContext()
    const { proposal } = useProposalContext()
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <>
            {proposal ? (
                <Stack anchor="bottom-right">
                    <PageLayout contextTitle={'Edit Proposal'} kind="narrow">
                        <Box gap="medium">
                            <ProposalHeader
                                proposal={proposal}
                                showConfiguration
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
                                            {proposal.templateDoc.content.requirements.trim() !==
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
                                                            proposal.templateDoc
                                                                .content
                                                                .requirements
                                                        }
                                                    </Text>
                                                </Box>
                                            )}
                                        </Box>
                                        <ProposalDescriptionForm
                                            proposal={proposal}
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
                                            proposal={proposal}
                                        />
                                    </Box>
                                </Tab>
                                {proposal.content.flexInputs.length > 0 && (
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
                                                proposal={proposal}
                                            />
                                        </Box>
                                    </Tab>
                                )}
                            </Tabs>
                            <PlainSectionDivider />
                            <ProposalSubmitControl proposal={proposal} />
                        </Box>
                    </PageLayout>
                    {proposal.status !== ProposalStatus.Draft &&
                        currentUser && (
                            <Messenger
                                currentUser={currentUser}
                                chatID={proposal.doc.streamID}
                                participantDIDs={[
                                    proposal.templateDoc.content.author,
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
