import React, { MutableRefObject, SetStateAction, useState } from 'react'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { CreateTemplateMultiStepForm } from './forms/CreateTemplateMultiStepForm'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ExportSuccessModal from '../composer/general/modals/ExportSuccessModal'

interface CreateTemplateUIProps {
    topRef: MutableRefObject<HTMLDivElement | null>
    composition: CompositionModel
    compositionCID: string
    setErrorMessage: React.Dispatch<
        SetStateAction<ErrorMessageType | undefined>
    >
}

const CreateTemplateUI = ({
    topRef,
    composition,
    compositionCID,
    setErrorMessage,
}: CreateTemplateUIProps) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)

    return (
        <>
            <CreateTemplateMultiStepForm
                topRef={topRef}
                composition={composition}
                compositionCID={compositionCID}
                onFailure={(errMsg) => setErrorMessage(errMsg)}
                onSuccess={toggleShowSuccessModal}
            />
            {showSuccessModal && (
                <ExportSuccessModal
                    keyId={compositionCID}
                    prefix="templates"
                    link="/templates/"
                    description="This is the link to your freshly created template. Share it with your clients and receive proposals."
                    title="New template created!"
                    onClose={toggleShowSuccessModal}
                />
            )}
        </>
    )
}

export default CreateTemplateUI
