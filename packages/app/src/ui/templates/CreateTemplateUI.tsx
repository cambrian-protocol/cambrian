import React, { useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateTemplateForm from './forms/CreateTemplateForm'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'

interface CreateTemplateUIProps {
    composition: CompositionModel
}

const CreateTemplateUI = ({ composition }: CreateTemplateUIProps) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)

    const [createdTemplateId, setCreatedTemplateId] = useState<string | null>(
        null
    )

    const onSuccess = (createdTemplateId: string) => {
        setCreatedTemplateId(createdTemplateId)
    }

    // TODO Show composition infos (title / description)
    return (
        <>
            <HeaderTextSection
                title="Create Template"
                subTitle="Configure a shareable template that can be filled in to propose a solution."
                paragraph="The blueprint you're using may require some inputs be completed. Inputs you do not complete will be completed by the customer."
            />
            <Box fill>
                <CreateTemplateForm composition={composition} />
                <Box pad="medium" />
            </Box>
        </>
    )
}

export default CreateTemplateUI
