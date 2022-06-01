import { ArrowRight, List } from 'phosphor-react'
import {
    CREATE_ARBITRATOR_STEPS,
    CreateArbitratorMultiStepStepsType,
} from '../CreateArbitratorMultiStepForm'

import { Box } from 'grommet'
import { Button } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import RecentExportsModal from '@cambrian/app/components/modals/RecentExportsModal'
import { UserType } from '@cambrian/app/store/UserContext'
import { useState } from 'react'

interface CreateArbitratorStartStepProps {
    stepperCallback: (step: CreateArbitratorMultiStepStepsType) => void
    currentUser: UserType
}

const CreateArbitratorStartStep = ({
    stepperCallback,
    currentUser,
}: CreateArbitratorStartStepProps) => {
    const [showRecentArbitratorsModal, setShowRecentArbitratorsModal] =
        useState(false)

    const toggleShowRecentArbitratorsModal = () =>
        setShowRecentArbitratorsModal(!showRecentArbitratorsModal)

    return (
        <>
            <MultiStepFormLayout
                nav={
                    <Box direction="row" justify="between" wrap>
                        <Box flex width={{ min: 'small' }} pad="xsmall">
                            <Button
                                secondary
                                size="small"
                                label="Recent Contracts"
                                icon={<List />}
                                onClick={toggleShowRecentArbitratorsModal}
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
                                    stepperCallback(CREATE_ARBITRATOR_STEPS.FEE)
                                }
                            />
                        </Box>
                    </Box>
                }
            >
                <HeaderTextSection
                    title="Arbitrator Contract"
                    subTitle="Create your own"
                    paragraph="This Arbitration Smart Contract will be tied to your wallet. Please input your take for an Arbitration Service."
                />
                <Box pad="medium" />
            </MultiStepFormLayout>
            {showRecentArbitratorsModal && currentUser.chainId && (
                <RecentExportsModal
                    prefix="arbitrator"
                    route=""
                    keyCID={currentUser.chainId.toString()}
                    title="Recent Arbitrator Contracts"
                    subTitle="Use on of your"
                    paragraph="Warning: These arbitrator contract addresses are just stored in your local storage. They will be lost if you clear the cache of your browser."
                    onClose={toggleShowRecentArbitratorsModal}
                />
            )}
        </>
    )
}

export default CreateArbitratorStartStep
