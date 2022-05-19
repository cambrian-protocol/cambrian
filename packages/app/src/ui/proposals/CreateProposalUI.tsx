import React, { MutableRefObject, SetStateAction, useState } from 'react'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateProposalMultiStepForm from './forms/CreateProposalMultiStepForm'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ExportSuccessModal from '../composer/general/modals/ExportSuccessModal'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'

interface CreateProposalUIProps {
    topRef: MutableRefObject<HTMLDivElement | null>
    composition: CompositionModel
    template: TemplateModel
    templateCID: string
    setErrorMessage: React.Dispatch<
        SetStateAction<ErrorMessageType | undefined>
    >
}

const CreateProposalUI = ({
    topRef,
    composition,
    template,
    templateCID,
    setErrorMessage,
}: CreateProposalUIProps) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)

    return (
        <>
            <CreateProposalMultiStepForm
                topRef={topRef}
                composition={composition}
                template={template}
                templateCID={templateCID}
                onFailure={(errMsg) => setErrorMessage(errMsg)}
                onSuccess={toggleShowSuccessModal}
            />
            {showSuccessModal && (
                <ExportSuccessModal
                    keyId={templateCID}
                    prefix="proposals"
                    link="/proposals/"
                    description="This is your Proposal ID. Share it with your community and fund the proposal."
                    title="Proposal created"
                    onClose={toggleShowSuccessModal}
                />
            )}
        </>
    )
}

export default CreateProposalUI
