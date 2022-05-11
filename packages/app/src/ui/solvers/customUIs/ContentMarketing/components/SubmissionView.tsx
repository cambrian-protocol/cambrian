import { Box } from 'grommet'
import { CircleDashed } from 'phosphor-react'
import { SubmissionModel } from '../models/SubmissionModel'
import { Text } from 'grommet'

interface PublicUIProps {
    latestSubmission: SubmissionModel
}

const SubmissionView = ({ latestSubmission }: PublicUIProps) => (
    <>
        <Box gap="medium" height={{ min: 'auto' }}>
            <Box
                fill
                background={'background-front'}
                pad="medium"
                round="small"
                elevation="small"
                border
            >
                {!latestSubmission || latestSubmission.submission === '' ? (
                    <Box fill justify="center" align="center" gap="small">
                        <CircleDashed size="36" />
                        <Text textAlign="center">
                            Nothing has been submitted yet
                        </Text>
                    </Box>
                ) : (
                    <Text style={{ whiteSpace: 'pre-line' }}>
                        {latestSubmission.submission}
                    </Text>
                )}
            </Box>
            <Box pad="small" />
        </Box>
    </>
)

export default SubmissionView
