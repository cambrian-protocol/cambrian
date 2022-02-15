import { Box, Button } from 'grommet'
import React, { useState } from 'react'

import { ClipboardText } from 'phosphor-react'
import CreateProposalForm from './forms/CreateProposalForm'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Link from 'next/link'
import ParticipantAvatar from '@cambrian/app/components/avatars/AvatarWithTitle'
import { SolutionModel } from '@cambrian/app/models/SolutionModel'
import { useRouter } from 'next/router'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

interface CreateProposalUIProps {
    solution: SolutionModel
}

// TODO get freshly created proposalID
const createdProposalId = '9187491875'

const CreateProposalUI = ({ solution }: CreateProposalUIProps) => {
    const [showSuccess, setShowSuccess] = useState(false)
    const [showFailure, setShowFailure] = useState(false)
    const [currentTemplate, setCurrentTemplate] = useState<TemplateModel>()
    const router = useRouter()
    const { templateId } = router.query

    return (
        <>
            {!showFailure && !showSuccess && (
                <>
                    <HeaderTextSection
                        title="Configure Proposal"
                        subTitle="Proposal configuration"
                        paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
                    />
                    <ParticipantAvatar
                        title={solution.seller.name}
                        pfpPath={solution.seller.pfp}
                        icon={solution.seller.icon}
                        role="Seller"
                    />
                    <HeaderTextSection
                        subTitle="Define the topic and price"
                        paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
                    />
                    <Box fill>
                        <CreateProposalForm
                            template={template}
                            onSuccess={() => setShowSuccess(true)}
                            onFailure={() => setShowFailure(true)}
                        />
                    </Box>
                </>
            )}
            {showSuccess && (
                <Box gap="large">
                    <HeaderTextSection
                        title="Success!"
                        subTitle="Proposal has been successfully created"
                        paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
                    />
                    <Box fill>
                        <Link href={`/proposals/${createdProposalId}`}>
                            <a>
                                <Button
                                    label="View Proposal"
                                    primary
                                    icon={<ClipboardText size="24" />}
                                />
                            </a>
                        </Link>
                    </Box>
                </Box>
            )}
            {showFailure && (
                <>
                    <HeaderTextSection
                        title="Something went wrong!"
                        subTitle="Please try again"
                        paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
                    />
                    <Button
                        label="Try again"
                        primary
                        onClick={() => setShowFailure(false)}
                    />
                </>
            )}
        </>
    )
}

export default CreateProposalUI
