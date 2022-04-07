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
import { Text } from 'grommet'
import { TextArea } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { fetchLatestSubmission } from '../helpers/fetchLatestSubmission'

interface WriterUIProps {
    currentCondition: SolverContractCondition
    currentUser: UserType
    solverContract: ethers.Contract
    latestSubmission: SubmissionModel
}

export const initialSubmission = {
    conditionId: '',
    sender: { address: '' },
    submission: '',
}

const SubmissionForm = ({
    currentCondition,
    currentUser,
    solverContract,
    latestSubmission,
}: WriterUIProps) => {
    const ipfs = new IPFSAPI()
    const [input, setInput] = useState<SubmissionModel>(latestSubmission)
    const [errorMsg, setErrorMsg] = useState<string>()
    const [transactionMsg, setTransactionMsg] = useState<string>()

    const submittedWorkFilter = solverContract.filters.SubmittedWork()

    useEffect(() => {
        solverContract.on(submittedWorkFilter, submissionListener)
        return () => {
            solverContract.removeListener(
                submittedWorkFilter,
                submissionListener
            )
        }
    }, [])

    const submissionListener = async () => {
        try {
            const logs = await solverContract.queryFilter(submittedWorkFilter)
            const fetchedLatesSubmission = await fetchLatestSubmission(
                logs,
                currentCondition
            )
            if (fetchedLatesSubmission) setInput(fetchedLatesSubmission)
        } catch (e: any) {
            console.error(e)
            setErrorMsg(e.message)
        }
        setTransactionMsg(undefined)
    }

    const onSubmit = async (): Promise<void> => {
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            if (input.submission === '') {
                throw new Error(
                    'Please insert something into the text area before you submit.'
                )
            }

            const workObj: SubmissionModel = {
                submission: input.submission,
                conditionId: currentCondition.conditionId,
                sender: { address: currentUser.address },
                timestamp: new Date(),
            }

            const response = await ipfs.pin(workObj)

            if (!response)
                throw new Error('Something went wrong while pinning to IPFS')

            await solverContract.submitWork(
                response.IpfsHash,
                currentCondition.conditionId
            )
            setTransactionMsg(TRANSACITON_MESSAGE['WAIT'])
        } catch (e: any) {
            console.error(e)
            setErrorMsg(e.message)
            setTransactionMsg(undefined)
        }
    }

    return (
        <>
            <Box fill gap="medium">
                {input.timestamp !== undefined && (
                    <Text size="small" color="dark-4">
                        Last submission:
                        {new Date(input.timestamp).toLocaleString()}
                    </Text>
                )}
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
                <Button primary label="Submit work" onClick={onSubmit} />
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
