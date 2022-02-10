import { Box, Button } from 'grommet'
import React, { useState } from 'react'

import { ClipboardText } from 'phosphor-react'
import CreateProposalForm from './forms/CreateProposalForm'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Link from 'next/link'
import ParticipantAvatar from '@cambrian/app/components/avatars/AvatarWithTitle'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import CreateTemplateForm from './forms/CreateTemplateForm'

interface CreateTemplateUIProps {
    composition: SolverModel[]
}

const CreateTemplateUI = ({ composition }: CreateTemplateUIProps) => {
    const [showSuccess, setShowSuccess] = useState(false)
    const [showFailure, setShowFailure] = useState(false)

    return (
        <>
            {!showFailure && !showSuccess && (
                <>
                    <HeaderTextSection
                        title="Create Template"
                        subTitle="Configure a shareable template that can be filled in to propose a solution."
                        paragraph="The blueprint you're using may require some inputs be completed. Inputs you do not complete will be completed by the customer."
                    />
                    <Box fill>
                        <CreateTemplateForm
                            composition={composition}
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
                        subTitle="Template has been successfully created"
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

export default CreateTemplateUI
