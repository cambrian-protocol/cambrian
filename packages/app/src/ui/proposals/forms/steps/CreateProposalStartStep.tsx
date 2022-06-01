import { ArrowRight, List } from 'phosphor-react'
import {
    CREATE_PROPOSAL_STEPS,
    CreateProposalMultiStepFormType,
    CreateProposalMultiStepStepsType,
} from '../CreateProposalMultiStepForm'

import AvatarWithLabel from '@cambrian/app/components/avatars/AvatarWithLabel'
import { Box } from 'grommet'
import { Button } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import RecentExportsModal from '@cambrian/app/components/modals/RecentExportsModal'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { useState } from 'react'

interface CreateProposalStartStepProps {
    templateCID: string
    template: TemplateModel
    input: CreateProposalMultiStepFormType
    stepperCallback: (step: CreateProposalMultiStepStepsType) => void
}

const CreateProposalStartStep = ({
    templateCID,
    template,
    stepperCallback,
    input,
}: CreateProposalStartStepProps) => {
    const [showRecentProposalsModal, setShowRecentProposalsModal] =
        useState(false)

    const toggleShowRecentProposalsModal = () =>
        setShowRecentProposalsModal(!showRecentProposalsModal)
    return (
        <>
            <MultiStepFormLayout
                nav={
                    <Box direction="row" justify="between" wrap>
                        <Box flex width={{ min: 'small' }} pad="xsmall">
                            <Button
                                secondary
                                size="small"
                                label="Recent Proposals"
                                icon={<List />}
                                onClick={toggleShowRecentProposalsModal}
                            />
                        </Box>
                        <Box flex width={{ min: 'small' }} pad="xsmall">
                            <Button
                                primary
                                size="small"
                                label="Get started"
                                icon={<ArrowRight />}
                                reverse
                                onClick={() =>
                                    stepperCallback(
                                        CREATE_PROPOSAL_STEPS.BUYER_DETAILS
                                    )
                                }
                            />
                        </Box>
                    </Box>
                }
            >
                <HeaderTextSection
                    title={template.title}
                    subTitle={`Configure a Proposal in ${
                        input.flexInputs.length > 0 ? 5 : 4
                    } steps`}
                    paragraph={template.description}
                />
                <AvatarWithLabel
                    role="Seller"
                    label={template.name}
                    pfpPath={template.pfp}
                />
                <Box pad="medium" />
            </MultiStepFormLayout>
            {showRecentProposalsModal && (
                <RecentExportsModal
                    prefix="proposals"
                    route="https://app.cambrianprotocol.com/proposals/"
                    keyCID={templateCID as string}
                    title="Recent proposals"
                    subTitle="Distribute on of your"
                    paragraph="Warning: These proposal IDs are just stored in your local storage. They will be lost if you clear the cache of your browser."
                    onClose={toggleShowRecentProposalsModal}
                />
            )}
        </>
    )
}

export default CreateProposalStartStep
