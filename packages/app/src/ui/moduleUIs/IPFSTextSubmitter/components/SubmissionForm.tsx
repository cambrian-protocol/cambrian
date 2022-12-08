import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { FloppyDisk, PaperPlaneRight } from 'phosphor-react'
import {
    ceramicInstance,
    saveCambrianCommitData,
} from '@cambrian/app/services/ceramic/CeramicUtils'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SubmissionModel } from '../models/SubmissionModel'
import { TextArea } from 'grommet'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [submissionsTileDocument, setSubmissionsTileDocument] =
        useState<TileDocument<SubmissionModel>>()

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        if (currentUser.did) {
            const submissionDoc = (await TileDocument.deterministic(
                ceramicInstance(currentUser),
                {
                    controllers: [currentUser.did],
                    family: 'cambrian-ipfs-text-submitter',
                    tags: [solverAddress],
                },
                { pin: true }
            )) as TileDocument<SubmissionModel>
            setInput(submissionDoc.content)
            setSubmissionsTileDocument(submissionDoc)
        }
    }

    const onSubmit = async (): Promise<void> => {
        setIsSubmitting(true)
        try {
            if (submissionsTileDocument) {
                await onSave()

                // NOTE: Work around until Ceramic fixes their commit load bug
                await saveCambrianCommitData(
                    currentUser,
                    submissionsTileDocument.commitId.toString()
                )

                const transaction: ethers.ContractTransaction =
                    await moduleContract.submit(
                        solverAddress,
                        submissionsTileDocument.commitId.toString(),
                        currentCondition.executions - 1
                    )
                const rc = await transaction.wait()
                if (
                    !rc.events?.find((event) => event.event === 'SubmittedWork')
                )
                    throw new Error('Error while submitting work')
            }
        } catch (e) {
            setErrorMsg(await cpLogger.push(e))
        }
        setIsSubmitting(false)
    }

    const onSave = async () => {
        setIsSaving(true)
        try {
            if (!currentUser.did || !currentUser.session)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            if (submissionsTileDocument) {
                await submissionsTileDocument.update(
                    {
                        submission: input.submission,
                        conditionId: currentCondition.conditionId,
                        sender: { address: currentUser.address },
                        timestamp: new Date(),
                    },
                    {
                        controllers: [currentUser.did],
                        family: 'cambrian-ipfs-text-submitter',
                        tags: [solverAddress],
                    },
                    { pin: true }
                )
            }
        } catch (e) {
            setErrorMsg(await cpLogger.push(e))
        }
        setIsSaving(false)
    }

    return (
        <>
            <Box
                fill
                gap="small"
                height={{ min: 'large' }}
                pad={{ bottom: 'medium' }}
            >
                <TextArea
                    disabled={isSubmitting}
                    placeholder="Submit your work here..."
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
                <TwoButtonWrapContainer
                    primaryButton={
                        <LoaderButton
                            isLoading={isSubmitting}
                            disabled={
                                latestSubmission.submission === input.submission
                            }
                            primary
                            reverse
                            icon={<PaperPlaneRight />}
                            label={'Submit'}
                            onClick={onSubmit}
                        />
                    }
                    secondaryButton={
                        <LoaderButton
                            secondary
                            disabled={
                                isSubmitting ||
                                input.submission ===
                                    submissionsTileDocument?.content.submission
                            }
                            isLoading={isSaving}
                            onClick={onSave}
                            label="Save"
                            icon={<FloppyDisk />}
                        />
                    }
                />
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
