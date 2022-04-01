import React, { useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateTemplateForm from './forms/CreateTemplateForm'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ExportSuccessModal from '../composer/general/modals/ExportSuccessModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'

interface CreateTemplateUIProps {
    composition: CompositionModel
    compositionCID: string
}

const CreateTemplateUI = ({
    composition,
    compositionCID,
}: CreateTemplateUIProps) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showFailureModal, setShowFailureModal] = useState(false)
    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)
    const toggleShowFailureModal = () => setShowFailureModal(!showFailureModal)

    const [templateCID, setTemplateCID] = useState<string>()

    const handleSuccess = (templateCID: string) => {
        setTemplateCID(templateCID)
        toggleShowSuccessModal()
    }

    return (
        <>
            <HeaderTextSection
                title="Create Template"
                subTitle="Configure a shareable template that can be filled in to propose a solution."
                paragraph="The blueprint you're using may require some inputs be completed. Inputs you do not complete will be completed by the customer."
            />
            <Box fill>
                <CreateTemplateForm
                    composition={composition}
                    compositionCID={compositionCID}
                    onFailure={toggleShowFailureModal}
                    onSuccess={handleSuccess}
                />
                <Box pad="medium" />
            </Box>
            {showSuccessModal && templateCID && (
                <ExportSuccessModal
                    ctaLabel="Create Proposal"
                    link="/templates/"
                    exportedCID={templateCID}
                    description="This is your CID for your exported template. Share it with your clients and receive proposals."
                    title="Template created"
                    onClose={toggleShowSuccessModal}
                />
            )}
            {showFailureModal && (
                <ErrorPopupModal onClose={toggleShowFailureModal} />
            )}
        </>
    )
}

export default CreateTemplateUI
