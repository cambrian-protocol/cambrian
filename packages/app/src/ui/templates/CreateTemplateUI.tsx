import React, { SetStateAction, useState } from 'react'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { CreateTemplateMultiStepForm } from './forms/CreateTemplateMultiStepForm'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ExportSuccessModal from '../composer/general/modals/ExportSuccessModal'
import { UserType } from '@cambrian/app/store/UserContext'

interface CreateTemplateUIProps {
    currentUser: UserType
    composition: CompositionModel
    compositionCID: string
    setErrorMessage: React.Dispatch<
        SetStateAction<ErrorMessageType | undefined>
    >
}

const CreateTemplateUI = ({
    composition,
    compositionCID,
    setErrorMessage,
    currentUser,
}: CreateTemplateUIProps) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)

    return (
        <>
            <CreateTemplateMultiStepForm
                composition={composition}
                compositionCID={compositionCID}
                onFailure={(errMsg) => setErrorMessage(errMsg)}
                onSuccess={toggleShowSuccessModal}
                currentUser={currentUser}
            />
            {showSuccessModal && (
                <ExportSuccessModal
                    keyId={compositionCID}
                    prefix="templates"
                    link={`${window.location.origin}/templates/`}
                    description="Share it with potential clients and receive proposals."
                    title="Listing created!"
                    onClose={toggleShowSuccessModal}
                />
            )}
        </>
    )
}

export default CreateTemplateUI
