import { Box, Button, Form, FormField, TextInput } from 'grommet'
import { PROFILE_WIZARD_STEPS, ProfileWizardStepsType } from '../ProfileWizard'
import { SetStateAction, useState } from 'react'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { isRequired } from '@cambrian/app/utils/helpers/validation'
import router from 'next/router'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface ProfileNameStepProps {
    profileInput: CambrianProfileType
    setProfileInput: React.Dispatch<SetStateAction<CambrianProfileType>>
    stepperCallback: (step: ProfileWizardStepsType) => void
    onSaveProfile: () => Promise<void>
}

const ProfileNameStep = ({
    profileInput,
    setProfileInput,
    stepperCallback,
    onSaveProfile,
}: ProfileNameStepProps) => {
    const { currentUser } = useCurrentUserContext()
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmit = async () => {
        setIsSaving(true)
        try {
            await onSaveProfile()
            stepperCallback(PROFILE_WIZARD_STEPS.BIO)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsSaving(false)
        }
    }

    return (
        <>
            <Box>
                <Box pad="xsmall">
                    <HeaderTextSection
                        title={`How would you like to be called?`}
                        paragraph="Set up your name and your profile picture"
                    />
                </Box>
                <Form onSubmit={onSubmit}>
                    <Box height={{ min: '50vh' }} justify="between">
                        <Box height={{ min: 'auto' }} pad="xsmall">
                            <FormField
                                name="name"
                                label="Your Name"
                                validate={[() => isRequired(profileInput.name)]}
                            >
                                <TextInput
                                    value={profileInput.name}
                                    onChange={(e) =>
                                        setProfileInput({
                                            ...profileInput,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Anon"
                                />
                            </FormField>
                            <Box direction="row" gap="medium">
                                {profileInput.avatar.trim() === '' ? (
                                    <BaseAvatar
                                        size="medium"
                                        address={currentUser?.address}
                                    />
                                ) : (
                                    <BaseAvatar
                                        size="medium"
                                        pfpPath={profileInput.avatar}
                                    />
                                )}

                                <Box flex>
                                    <FormField
                                        name="avatar"
                                        label="Profile picture"
                                    >
                                        <TextInput
                                            value={profileInput.avatar}
                                            onChange={(e) =>
                                                setProfileInput({
                                                    ...profileInput,
                                                    avatar: e.target.value,
                                                })
                                            }
                                            placeholder="https://your.profile.picture"
                                        />
                                    </FormField>
                                </Box>
                            </Box>
                        </Box>
                        <ButtonRowContainer
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
                                    label={'Cancel'}
                                    onClick={() => router.push('/')}
                                />
                            }
                        />
                    </Box>
                </Form>
            </Box>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ProfileNameStep
