import {
    Box,
    Button,
    Form,
    FormField,
    Text,
    TextArea,
    TextInput,
} from 'grommet'
import { PROFILE_WIZARD_STEPS, ProfileWizardStepsType } from '../ProfileWizard'
import { SetStateAction, useState } from 'react'

import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface ProfileBioStepProps {
    profileInput: CambrianProfileType
    setProfileInput: React.Dispatch<SetStateAction<CambrianProfileType>>
    stepperCallback: (step: ProfileWizardStepsType) => void
    onSaveProfile: () => Promise<void>
}

const ProfileBioStep = ({
    profileInput,
    setProfileInput,
    stepperCallback,
    onSaveProfile,
}: ProfileBioStepProps) => {
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmit = async () => {
        setIsSaving(true)
        try {
            await onSaveProfile()
            stepperCallback(PROFILE_WIZARD_STEPS.CONTACT)
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
                        title={`What is your profession?`}
                        paragraph="You can set up your title and bio or skip this step"
                    />
                </Box>
                <Form onSubmit={onSubmit}>
                    <Box height={{ min: '50vh' }} justify="between">
                        <Box height={{ min: 'auto' }} pad="xsmall">
                            <FormField name="title" label="Title">
                                <TextInput
                                    value={profileInput.title}
                                    onChange={(e) =>
                                        setProfileInput({
                                            ...profileInput,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </FormField>
                            <Box>
                                <FormField label="Bio" name="description">
                                    <TextArea
                                        name="description"
                                        rows={5}
                                        resize={false}
                                        maxLength={420}
                                        value={profileInput.description}
                                        onChange={(e) =>
                                            setProfileInput({
                                                ...profileInput,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </FormField>
                                <Text
                                    color="dark-4"
                                    size="small"
                                    textAlign="end"
                                >
                                    {profileInput.description.length}/420
                                </Text>
                            </Box>
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
                                        stepperCallback(
                                            PROFILE_WIZARD_STEPS.NAME
                                        )
                                    }
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

export default ProfileBioStep
