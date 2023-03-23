import { Box, Button, Form } from 'grommet'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { ProposalInputType } from '../../EditProposalUI'
import ProposalPricingForm from '../../forms/ProposalPricingForm'
import { SetStateAction } from 'react'
import _ from 'lodash'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalPricingStepProps {
    proposalInput: ProposalInputType
    setProposalInput: React.Dispatch<SetStateAction<ProposalInputType>>
    onSave: () => Promise<void>
    onBack: () => void
    isSaving: boolean
}

const ProposalPricingStep = ({
    proposalInput,
    setProposalInput,
    onSave,
    onBack,
    isSaving,
}: ProposalPricingStepProps) => {
    const { proposal } = useProposalContext()

    return (
        <Box>
            <HeaderTextSection title="Great! And how much are you willing to pay?" />
            {proposal ? (
                <Form onSubmit={onSave}>
                    <ProposalPricingForm
                        proposal={proposal}
                        proposalInput={proposalInput}
                        setProposalInput={setProposalInput}
                    />
                    <ButtonRowContainer
                        primaryButton={
                            <LoaderButton
                                isLoading={isSaving}
                                size="small"
                                primary
                                label={'Continue'}
                                type="submit"
                            />
                        }
                        secondaryButton={
                            <Button
                                size="small"
                                secondary
                                label={'Back'}
                                onClick={onBack}
                            />
                        }
                    />
                </Form>
            ) : (
                <Box height="large" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'small'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default ProposalPricingStep
