import {
    CambrianProfileType,
    UserType,
    initialCambrianProfile,
} from '@cambrian/app/store/UserContext'
import { useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import ProfileBioStep from './steps/ProfileBioStep'
import ProfileContactStep from './steps/ProfileContactStep'
import ProfileNameStep from './steps/ProfileNameStep'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'

interface ProfileWizardProps {
    currentUser: UserType
    successRoute?: string
}

export enum PROFILE_WIZARD_STEPS {
    NAME,
    BIO,
    CONTACT,
}
export type ProfileWizardStepsType =
    | PROFILE_WIZARD_STEPS.NAME
    | PROFILE_WIZARD_STEPS.BIO
    | PROFILE_WIZARD_STEPS.CONTACT

const ProfileWizard = ({ currentUser, successRoute }: ProfileWizardProps) => {
    const [input, setInput] = useState<CambrianProfileType>(
        initialCambrianProfile
    )
    const [currentStep, setCurrentStep] = useState<ProfileWizardStepsType>(
        PROFILE_WIZARD_STEPS.NAME
    )

    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [currentStep])

    useEffect(() => {
        setInput({
            ...initialCambrianProfile,
            ...currentUser.cambrianProfileDoc.content,
        })
    }, [])

    const onSave = async () => {
        await currentUser.cambrianProfileDoc.update(input)
    }

    const renderCurrentFormStep = () => {
        switch (currentStep) {
            case PROFILE_WIZARD_STEPS.NAME:
                return (
                    <ProfileNameStep
                        stepperCallback={setCurrentStep}
                        onSaveProfile={onSave}
                        profileInput={input}
                        setProfileInput={setInput}
                    />
                )
            case PROFILE_WIZARD_STEPS.BIO:
                return (
                    <ProfileBioStep
                        setProfileInput={setInput}
                        stepperCallback={setCurrentStep}
                        onSaveProfile={onSave}
                        profileInput={input}
                    />
                )
            case PROFILE_WIZARD_STEPS.CONTACT:
                return (
                    <ProfileContactStep
                        setProfileInput={setInput}
                        stepperCallback={setCurrentStep}
                        onSaveProfile={onSave}
                        profileInput={input}
                        successRoute={successRoute}
                    />
                )
            default:
                return <></>
        }
    }

    return (
        <>
            <Box height={{ min: '90vh' }} justify="center" pad="large">
                {/* TODO Wizard Nav  */}
                {renderCurrentFormStep()}
            </Box>
        </>
    )
}

export default ProfileWizard
