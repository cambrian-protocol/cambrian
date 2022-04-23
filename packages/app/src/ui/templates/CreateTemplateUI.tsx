import React, { SetStateAction, useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateTemplateForm from './forms/CreateTemplateForm'
import ExportSuccessModal from '../composer/general/modals/ExportSuccessModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'

interface CreateTemplateUIProps {
    composition: CompositionModel
    compositionCID: string
    setErrorMessage: React.Dispatch<SetStateAction<string | undefined>>
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
            <HeaderTextSection
                title="Create your own Template"
                subTitle="Configure a shareable template that can be filled in to propose a solution."
                paragraph="The blueprint you're using may require some inputs be completed. Inputs you do not complete will be completed by the customer."
            />
            <Box fill>
                <CreateTemplateForm
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
                    description="This is your link to your freshly created template. Share it with your clients and receive proposals."
                    title="New template created!"
                    onClose={toggleShowSuccessModal}
                />
            )}
        </>
    )
}

export default CreateTemplateUI
