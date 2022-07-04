import { Anchor, Box, Button, TextInput } from 'grommet'
import { Check, Copy } from 'phosphor-react'
import { useEffect, useState } from 'react'

import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'

interface TemplatePublishStepProps {
    templateStreamID: string
}

const TemplatePublishStep = ({
    templateStreamID,
}: TemplatePublishStepProps) => {
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isSavedToClipboard) {
            intervalId = setInterval(() => {
                setIsSavedToClipboard(false)
            }, 2000)
        }
        return () => clearInterval(intervalId)
    }, [isSavedToClipboard])

    return (
        <>
            <Box height={{ min: '60vh' }} justify="between">
                <Box>
                    <HeaderTextSection
                        title="Share your template"
                        paragraph="Spread the word and distibute your template to your future clients."
                    />
                </Box>
                <Box direction="row" gap="small">
                    <TextInput
                        value={`${window.location.origin}/templates/${templateStreamID}`}
                    />
                    <Button
                        icon={isSavedToClipboard ? <Check /> : <Copy />}
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `${window.location.origin}/templates/${templateStreamID}`
                            )
                            setIsSavedToClipboard(true)
                        }}
                    />
                </Box>
                <Box direction="row" justify="between">
                    <Anchor
                        href={`/dashboard/templates/edit/${templateStreamID}`}
                    >
                        <Button secondary label="Edit template" size="small" />
                    </Anchor>
                    <Anchor href={`/templates/${templateStreamID}`}>
                        <Button primary label="View template" size="small" />
                    </Anchor>
                </Box>
            </Box>
        </>
    )
}

export default TemplatePublishStep
