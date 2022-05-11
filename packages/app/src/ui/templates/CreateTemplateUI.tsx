import React, { SetStateAction, useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { CreateTemplateMultiStepForm } from './forms/CreateTemplateMultiStepForm'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ExportSuccessModal from '../composer/general/modals/ExportSuccessModal'

interface CreateTemplateUIProps {
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
}: CreateTemplateUIProps) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)

    return (
        <>
            <Box fill>
                <CreateTemplateMultiStepForm
                    composition={composition}
                    compositionCID={compositionCID}
                    onFailure={(errMsg) => setErrorMessage(errMsg)}
                    onSuccess={toggleShowSuccessModal}
                />
                <Box pad="medium" />
            </Box>
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
