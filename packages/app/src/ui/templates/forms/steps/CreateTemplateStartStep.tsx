import { ArrowRight, List } from 'phosphor-react'
import {
    CREATE_TEMPLATE_STEPS,
    CreateTemplateMultiStepFormType,
    CreateTemplateMultiStepStepsType,
} from '../CreateTemplateMultiStepForm'

import { Box } from 'grommet'
import { Button } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import RecentExportsModal from '@cambrian/app/components/modals/RecentExportsModal'
import { useState } from 'react'

interface CreateTemplateStartStepProps {
    input: CreateTemplateMultiStepFormType
    stepperCallback: (step: CreateTemplateMultiStepStepsType) => void
    compositionCID: string
}

const CreateTemplateStartStep = ({
    input,
    stepperCallback,
    compositionCID,
}: CreateTemplateStartStepProps) => {
    const [showRecentTemplatesModal, setShowRecentTemplatesModal] =
        useState(false)

    const toggleShowRecentTemplatesModal = () =>
        setShowRecentTemplatesModal(!showRecentTemplatesModal)

    return (
        <>
            <MultiStepFormLayout
                nav={
                    <Box direction="row" justify="between" wrap>
                        <Box flex width={{ min: 'small' }} pad="xsmall">
                            <Button
                                secondary
                                size="small"
                                label="Finished templates"
                                icon={<List />}
                                onClick={toggleShowRecentTemplatesModal}
                            />
                        </Box>
                        <Box flex width={{ min: 'small' }} pad="xsmall">
                            <Button
                                primary
                                size="small"
                                label="Get started"
                                icon={<ArrowRight />}
                                reverse
                                onClick={() =>
                                    stepperCallback(
                                        CREATE_TEMPLATE_STEPS.SELLER_DETAILS
                                    )
                                }
                            />
                        </Box>
                    </Box>
                }
            >
                <HeaderTextSection
                    title="Let's do something!"
                    subTitle={`Configure a shareable template in ${
                        input.flexInputs.length > 0 ? 5 : 4
                    } steps`}
                    paragraph="The blueprint you're using may require some inputs be completed. Inputs you do not complete will be completed by the customer."
                />
            </MultiStepFormLayout>
            {showRecentTemplatesModal && (
                <RecentExportsModal
                    prefix="templates"
                    route="/templates/"
                    keyCID={compositionCID as string}
                    title="Recent templates"
                    subTitle="Distribute on of your"
                    paragraph="Warning: These template CIDs are just stored in your local storage. They will be lost if you clear the cache of your browser."
                    onClose={toggleShowRecentTemplatesModal}
                />
            )}
        </>
    )
}

export default CreateTemplateStartStep
