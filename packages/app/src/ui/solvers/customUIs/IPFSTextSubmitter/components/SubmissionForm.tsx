import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SubmissionModel } from '../models/SubmissionModel'
import { TextArea } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { initialSubmission } from './SubmissionContainer'

interface WriterUIProps {
    currentCondition: SolverContractCondition
    currentUser: UserType
    solverAddress: string
    moduleContract: ethers.Contract
    latestSubmission: SubmissionModel
}

const SubmissionForm = ({
    currentCondition,
    currentUser,
    solverAddress,
    moduleContract,
    latestSubmission,
}: WriterUIProps) => {
    const [input, setInput] = useState<SubmissionModel>(initialSubmission)
    const [errorMsg, setErrorMsg] = useState<ErrorMessageType>()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    useEffect(() => {
        setInput(latestSubmission)
    }, [latestSubmission])

    const onSubmit = async (): Promise<void> => {
        setIsSubmitting(true)
        try {
            if (input.submission === '') {
                throw new Error(
                    'Please insert something into the text area before you submit.'
                )
            }

            if (!currentUser.address)
                throw GENERAL_ERROR['NO_WALLET_CONNECTION']

            const submission: SubmissionModel = {
                submission: input.submission,
                conditionId: currentCondition.conditionId,
                sender: { address: currentUser.address },
                timestamp: new Date(),
            }
            const ipfs = new IPFSAPI()
            const response = await ipfs.pin(submission)

            if (!response) throw GENERAL_ERROR['IPFS_PIN_ERROR']

            const transaction: ethers.ContractTransaction =
                await moduleContract.submit(
                    solverAddress,
                    response.IpfsHash,
                    currentCondition.executions - 1
                )
            const rc = await transaction.wait()
            if (!rc.events?.find((event) => event.event === 'SubmittedWork'))
                throw new Error('Error while submitting work')
        } catch (e) {
            setErrorMsg(await cpLogger.push(e))
        }
        setIsSubmitting(false)
    }
    return (
        <>
            <Box fill gap="medium" height={{ min: 'large' }}>
                <TextArea
                    disabled={isSubmitting}
                    placeholder="Type your article here..."
                    fill
                    size="medium"
                    resize={false}
                    value={input.submission}
                    onChange={(event) =>
                        setInput({
                            ...input,
                            submission: event.target.value,
                        })
                    }
                />
                <LoaderButton
                    isLoading={isSubmitting}
                    disabled={
                        input.submission === latestSubmission.submission ||
                        input.submission.trim() === '' ||
                        isSubmitting
                    }
                    primary
                    label={'Submit work'}
                    onClick={onSubmit}
                />
                <Box pad="small" />
            </Box>
            {errorMsg && (
                <ErrorPopupModal
                    onClose={() => setErrorMsg(undefined)}
                    errorMessage={errorMsg}
                />
            )}
        </>
    )
}

export default SubmissionForm
