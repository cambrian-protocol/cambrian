import CreateTemplateForm, {
    CreateTemplateFormType,
} from './forms/CreateTemplateForm'
import React, { useState } from 'react'

import { Box } from 'grommet'
import { Button } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ExportSuccessModal from '../composer/general/modals/ExportSuccessModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SolutionPreviewModal from '../../components/modals/SolutionPreviewModal'
import Stagehand from '@cambrian/app/classes/Stagehand'

interface CreateTemplateUIProps {
    stagehand: Stagehand
    composition: CompositionModel
}

const CreateTemplateUI = ({
    stagehand,
    composition,
}: CreateTemplateUIProps) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)

    const [showSolutionPreviewModal, setShowSolutionPreviewModal] =
        useState(false)

    const toggleShowSolutionPreviewModal = () =>
        setShowSolutionPreviewModal(!showSolutionPreviewModal)

    const [createdTemplateCID, setCreatedTemplateCID] = useState<string>()

    const onSubmit = async (templateInput: CreateTemplateFormType) => {
        /*      const ipfsHash = await stagehand.publishTemplate(templateInput)
        setCreatedTemplateCID(ipfsHash)
        toggleShowSuccessModal() */
    }

    // TODO
    const handleFailure = () => {}

    return (
        <>
            <HeaderTextSection
                title="Create Template"
                subTitle="Configure a shareable template that can be filled in to propose a solution."
                paragraph="The blueprint you're using may require some inputs be completed. Inputs you do not complete will be completed by the customer."
            />
            <Box fill gap="medium">
                <Button
                    onClick={toggleShowSolutionPreviewModal}
                    secondary
                    label="Show Solution preview"
                />
                <CreateTemplateForm
                    composition={composition}
                    onSubmit={onSubmit}
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
            {showSolutionPreviewModal && (
                <SolutionPreviewModal
                    onBack={toggleShowSolutionPreviewModal}
                    composition={composition}
                />
            )}
        </>
    )
}

export default CreateTemplateUI
