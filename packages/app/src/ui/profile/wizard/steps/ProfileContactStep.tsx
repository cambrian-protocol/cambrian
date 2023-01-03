import { Box, Button, Form, FormField, TextInput } from 'grommet'
import { PROFILE_WIZARD_STEPS, ProfileWizardStepsType } from '../ProfileWizard'
import { SetStateAction, useState } from 'react'

import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { isRequired } from '@cambrian/app/utils/helpers/validation'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import { useRouter } from 'next/router'

interface ProfileContactStepProps {
    profileInput: CambrianProfileType
    setProfileInput: React.Dispatch<SetStateAction<CambrianProfileType>>
    stepperCallback: (step: ProfileWizardStepsType) => void
    onSaveProfile: () => Promise<void>
    successRoute?: string
}

const ProfileContactStep = ({
    profileInput,
    setProfileInput,
    stepperCallback,
    onSaveProfile,
    successRoute,
}: ProfileContactStepProps) => {
    const { setAndLogError } = useErrorContext()
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)

    const onSubmit = async () => {
        setIsSaving(true)
        try {
            await onSaveProfile()
            router.push(successRoute || '/dashboard')
        } catch (e) {
            setAndLogError(e)
            setIsSaving(false)
        }
    }

    return (
        <Box>
            <Box pad="xsmall">
                <HeaderTextSection
                    title={`Where can we notify you?`}
                    paragraph="We need your email address in order to send you notifications about your solvers"
                />
            </Box>
            <Form onSubmit={onSubmit}>
                <Box height={{ min: '50vh' }} justify="between">
                    <Box height={{ min: 'auto' }} pad="xsmall">
                        <FormField
                            name="email"
                            label="Email address"
                            validate={[() => isRequired(profileInput.email)]}
                        >
                            <TextInput
                                placeholder="your.email@address.com"
                                value={profileInput.email}
                                onChange={(e) =>
                                    setProfileInput({
                                        ...profileInput,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </FormField>
                    </Box>
                    <TwoButtonWrapContainer
                        primaryButton={
                            <LoaderButton
                                isLoading={isSaving}
                                size="small"
                                primary
                                label={'Save & Continue'}
                                type="submit"
                            />
                        }
                        secondaryButton={
                            <Button
                                size="small"
                                secondary
                                label={'Back'}
                                onClick={() =>
                                    stepperCallback(PROFILE_WIZARD_STEPS.BIO)
                                }
                            />
                        }
                    />
                </Box>
            </Form>
        </Box>
    )
}

export default ProfileContactStep
