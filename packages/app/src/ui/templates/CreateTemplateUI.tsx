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
                    onSuccess={toggleShowSuccessModal}
                />
                <Box pad="medium" />
            </Box>
            {showSuccessModal && (
                <ExportSuccessModal
                    keyId={compositionCID}
                    prefix="templates"
                    link="/templates/"
                    description="This is your link to your freshly created template. Share it with your clients and receive proposals."
                    title="New template created!"
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
