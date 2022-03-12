import React, { useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateTemplateForm from './forms/CreateTemplateForm'
import ExportSuccessModal from '../composer/general/modals/ExportSuccessModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'

interface CreateTemplateUIProps {
    compositionCID: string
    composition: CompositionModel
}

const CreateTemplateUI = ({
    composition,
    compositionCID,
}: CreateTemplateUIProps) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)

    const [createdTemplateCID, setCreatedTemplateCID] = useState<string>()

    const handleSuccess = (templateCID: string) => {
        setCreatedTemplateCID(templateCID)
        toggleShowSuccessModal()
    }

    // TODO
    const handleFailure = () => {}

    // TODO Show composition infos (title / description)
    return (
        <>
            <HeaderTextSection
                title="Create Template"
                subTitle="Configure a shareable template that can be filled in to propose a solution."
                paragraph="The blueprint you're using may require some inputs be completed. Inputs you do not complete will be completed by the customer."
            />
            <Box fill>
                <CreateTemplateForm
                    compositionCID={compositionCID}
                    composition={composition}
                    onSuccess={handleSuccess}
                    onFailure={handleFailure}
                />
                <Box pad="medium" />
            </Box>
            {showSuccessModal && createdTemplateCID && (
                <ExportSuccessModal
                    ctaLabel="Create Proposal"
                    link="/templates/"
                    exportedCID={createdTemplateCID}
                    description="This is your CID for your exported template. Share it with your clients and receive proposals."
                    title="Template created"
                    onClose={toggleShowSuccessModal}
                />
            )}
        </>
    )
}

export default CreateTemplateUI
