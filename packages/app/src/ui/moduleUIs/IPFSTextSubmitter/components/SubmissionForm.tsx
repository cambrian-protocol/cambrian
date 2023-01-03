import 'react-quill/dist/quill.snow.css'

import { FloppyDisk, PaperPlaneRight } from 'phosphor-react'
import {
    ceramicInstance,
    saveCambrianCommitData,
} from '@cambrian/app/services/ceramic/CeramicUtils'
import styled, { css } from 'styled-components'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SubmissionModel } from '../models/SubmissionModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpTheme } from '@cambrian/app/theme/theme'
import dynamic from 'next/dynamic'
import { ethers } from 'ethers'
import { initialSubmission } from './SubmissionContainer'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

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
    const { setAndLogError } = useErrorContext()
    const [input, setInput] = useState<SubmissionModel>(initialSubmission)
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
            setAndLogError(e)
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
            setAndLogError(e)
        }
        setIsSaving(false)
    }

    return (
        <Box
            fill
            gap="small"
            height={{ min: 'large', max: 'large' }}
            pad={{ bottom: 'medium' }}
        >
            <Box
                flex
                border
                round="xsmall"
                background="background-contrast-transparent"
                color="white"
                overflow={'hidden'}
            >
                <StyledReactQuill
                    theme="snow"
                    readOnly={isSubmitting}
                    value={input.submission}
                    onChange={(e) => {
                        setInput({
                            ...input,
                            submission: e,
                        })
                    }}
                />
            </Box>
            <Box height={{ min: 'auto' }}>
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
        </Box>
    )
}

export default SubmissionForm

const StyledReactQuill = styled(ReactQuill)`
    height: calc(100% - 42px);

    .ql-container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .ql-toolbar.ql-snow {
        border-color: transparent transparent
            ${(props) =>
                css`
                    ${cpTheme.global.colors['dark-4']}
                `}
            transparent;
    }
    .ql-container.ql-snow {
        border-color: transparent;
    }

    .ql-snow .ql-list,
    .ql-snow .ql-picker {
        color: ${(props) =>
            css`
                ${cpTheme.global.colors['dark-4']}
            `};
        border-radius: ${(props) =>
            css`
                ${cpTheme.global.borderSize?.small}
            `};
    }
    .ql-snow .ql-stroke {
        stroke: ${(props) =>
            css`
                ${cpTheme.global.colors['dark-4']}
            `};
    }
    .ql-snow .ql-fill {
        fill: ${(props) =>
            css`
                ${cpTheme.global.colors['dark-4']}
            `};
    }
    .ql-snow .ql-picker-options {
        border-radius: ${(props) =>
            css`
                ${cpTheme.global.borderSize.small}
            `};
        background-color: ${(props) =>
            css`
                ${cpTheme.global.colors['background-contrast'].dark}
            `};
    }
    .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options,
    .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label {
        border-color: transparent;
    }

    .ql-snow.ql-toolbar button:hover .ql-stroke,
    .ql-snow .ql-toolbar button:hover .ql-stroke,
    .ql-snow.ql-toolbar button:focus .ql-stroke,
    .ql-snow .ql-toolbar button:focus .ql-stroke,
    .ql-snow.ql-toolbar button.ql-active .ql-stroke,
    .ql-snow .ql-toolbar button.ql-active .ql-stroke,
    .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
    .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
    .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
    .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
    .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
    .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
    .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
    .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
    .ql-snow.ql-toolbar button:hover .ql-stroke-miter,
    .ql-snow .ql-toolbar button:hover .ql-stroke-miter,
    .ql-snow.ql-toolbar button:focus .ql-stroke-miter,
    .ql-snow .ql-toolbar button:focus .ql-stroke-miter,
    .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
    .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter,
    .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
    .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
    .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
    .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
    .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
    .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
    .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
    .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
        stroke: ${(props) =>
            css`
                ${cpTheme.global.colors['brand'].dark}
            `};
    }

    .ql-snow.ql-toolbar button:hover .ql-fill,
    .ql-snow .ql-toolbar button:hover .ql-fill,
    .ql-snow.ql-toolbar button:focus .ql-fill,
    .ql-snow .ql-toolbar button:focus .ql-fill,
    .ql-snow.ql-toolbar button.ql-active .ql-fill,
    .ql-snow .ql-toolbar button.ql-active .ql-fill,
    .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
    .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
    .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
    .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
    .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
    .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
    .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
    .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill,
    .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill {
        fill: ${(props) =>
            css`
                ${cpTheme.global.colors['brand'].dark}
            `};
    }

    .ql-snow.ql-toolbar button:hover,
    .ql-snow .ql-toolbar button:hover,
    .ql-snow.ql-toolbar button:focus,
    .ql-snow .ql-toolbar button:focus,
    .ql-snow.ql-toolbar button.ql-active,
    .ql-snow .ql-toolbar button.ql-active,
    .ql-snow.ql-toolbar .ql-picker-label:hover,
    .ql-snow .ql-toolbar .ql-picker-label:hover,
    .ql-snow.ql-toolbar .ql-picker-label.ql-active,
    .ql-snow .ql-toolbar .ql-picker-label.ql-active,
    .ql-snow.ql-toolbar .ql-picker-item:hover,
    .ql-snow .ql-toolbar .ql-picker-item:hover,
    .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
    .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
        color: ${(props) =>
            css`
                ${cpTheme.global.colors['brand'].dark}
            `};
    }

    .ql-editor {
        ::-webkit-scrollbar {
            width: 10px;
        }

        /* Track */
        ::-webkit-scrollbar-track {
            background: ${(props) =>
                css`
                    ${cpTheme.global.colors['background-back'].dark}
                `};
        }

        /* Handle */
        ::-webkit-scrollbar-thumb {
            background: ${(props) =>
                css`
                    ${cpTheme.global.colors['background-front'].dark}
                `};
        }

        /* Handle on hover */
        ::-webkit-scrollbar-thumb:hover {
            background: ${(props) =>
                css`
                    ${cpTheme.global.colors['background-contrast-hover'].dark}
                `};
        }
    }
`
