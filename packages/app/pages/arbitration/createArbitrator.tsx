import { Box } from 'grommet'
import CreateArbitratorMultiStepForm from '@cambrian/app/ui/arbitrator/create/CreateArbitratorMultiStepForm'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ExportSuccessModal from '@cambrian/app/ui/composer/general/modals/ExportSuccessModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useState } from 'react'

export default function CreateArbitrator() {
    const { currentUser } = useCurrentUser()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)

    return (
        <>
            {currentUser ? (
                <PageLayout contextTitle="Create Arbitrator">
                    <Box
                        height={{ min: '90vh' }}
                        justify="center"
                        align="center"
                    >
                        <CreateArbitratorMultiStepForm
                            currentUser={currentUser}
                            onFailure={(errMsg) => setErrorMessage(errMsg)}
                            onSuccess={toggleShowSuccessModal}
                        />
                    </Box>
                </PageLayout>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
            {showSuccessModal && currentUser && (
                <ExportSuccessModal
                    keyId={currentUser.chainId.toString()}
                    prefix={currentUser.address}
                    link=""
                    description="This is your Arbitrator Contract Address. Share it with your community and offer Arbitration Services for Solutions with it."
                    title="Arbitrator Contract created"
                    onClose={toggleShowSuccessModal}
                />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}
