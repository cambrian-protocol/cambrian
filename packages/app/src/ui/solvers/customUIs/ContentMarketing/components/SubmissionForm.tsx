import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { Button } from 'grommet'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { Stack } from 'grommet'
import { SubmissionModel } from '../models/SubmissionModel'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { TextArea } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

interface WriterUIProps {
    currentCondition: SolverContractCondition
    currentUser: UserType
    solverContract: ethers.Contract
    latestSubmission: SubmissionModel
}

const SubmissionForm = ({
    currentCondition,
    currentUser,
    solverContract,
    latestSubmission,
}: WriterUIProps) => {
    const [input, setInput] = useState<SubmissionModel>(latestSubmission)
    const [errorMsg, setErrorMsg] = useState<ErrorMessageType>()
    const [transactionMsg, setTransactionMsg] = useState<string>()

    useEffect(() => {
        setInput(latestSubmission)
    }, [latestSubmission])

    const onSubmit = async (): Promise<void> => {
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
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
                await solverContract.submitWork(
                    response.IpfsHash,
                    currentCondition.conditionId
                )
            setTransactionMsg(TRANSACITON_MESSAGE['WAIT'])
            const rc = await transaction.wait()
            if (!rc.events?.find((event) => event.event === 'SubmittedWork'))
                throw new Error('Error while submitting work')
        } catch (e) {
            setErrorMsg(await cpLogger.push(e))
        }
        setTransactionMsg(undefined)
    }
    return (
        <>
            <Box fill gap="medium">
                <Stack anchor="center" fill>
                    <TextArea
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
                </Stack>
                <Button
                    disabled={
                        input.submission === latestSubmission.submission ||
                        input.submission.trim() === ''
                    }
                    primary
                    label="Submit work"
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
            {transactionMsg && <LoadingScreen context={transactionMsg} />}
        </>
    )
}

export default SubmissionForm
