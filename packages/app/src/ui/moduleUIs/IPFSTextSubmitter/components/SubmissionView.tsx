import 'react-quill/dist/quill.bubble.css'

import { Box } from 'grommet'
import { CircleDashed } from 'phosphor-react'
import { SubmissionModel } from '../models/SubmissionModel'
import { Text } from 'grommet'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface PublicUIProps {
    latestSubmission: SubmissionModel
}

const SubmissionView = ({ latestSubmission }: PublicUIProps) => (
    <>
        <Box gap="medium" height={{ min: 'auto' }} flex>
            <Box
                fill
                background={'background-contrast'}
                pad="medium"
                round="xsmall"
                elevation="small"
                border
                height={{ min: 'large' }}
            >
                {!latestSubmission || latestSubmission.submission === '' ? (
                    <Box fill justify="center" align="center" gap="small">
                        <CircleDashed size="36" />
                        <Text textAlign="center">
                            Nothing has been submitted yet
                        </Text>
                    </Box>
                ) : (
                    <ReactQuill
                        value={latestSubmission.submission}
                        theme={'bubble'}
                    />
                )}
            </Box>
        </Box>
    </>
)

export default SubmissionView
