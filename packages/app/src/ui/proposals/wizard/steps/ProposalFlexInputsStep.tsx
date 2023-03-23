import { Box, Button, Form } from 'grommet'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ProposalFlexInputsForm from '../../forms/ProposalFlexInputsForm'
import { ProposalInputType } from '../../EditProposalUI'
import { SetStateAction } from 'react'
import _ from 'lodash'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalFlexInputsStepProps {
    proposalInput: ProposalInputType
    setProposalInput: React.Dispatch<SetStateAction<ProposalInputType>>
    onSave: () => Promise<void>
    onBack: () => void
    isSaving: boolean
}

const ProposalFlexInputsStep = ({
    proposalInput,
    setProposalInput,
    onSave,
    onBack,
    isSaving,
}: ProposalFlexInputsStepProps) => {
    const { proposal } = useProposalContext()

    return (
        <Box>
            <HeaderTextSection
                title="Reasonable. Just a few more details"
                paragraph="Please input the following information to set up the Solver correctly."
            />
            {proposal ? (
                <Form onSubmit={onSave}>
                    <ProposalFlexInputsForm
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
                <Box height="medium" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                </Box>
            )}
        </Box>
    )
}

export default ProposalFlexInputsStep
