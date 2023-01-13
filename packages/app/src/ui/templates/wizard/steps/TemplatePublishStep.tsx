import { Box, Button, TextInput } from 'grommet'
import { Check, Copy } from 'phosphor-react'
import { useEffect, useState } from 'react'

import { EditTemplatePropsType } from '@cambrian/app/hooks/useEditTemplate'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Link from 'next/link'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'

const TemplatePublishStep = ({
    editTemplateProps,
}: {
    editTemplateProps: EditTemplatePropsType
}) => {
    const { templateStreamID } = editTemplateProps
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
                <Box pad="xsmall">
                    <HeaderTextSection
                        title="Share your template"
                        paragraph="Spread the word and distibute your template to your future clients."
                    />
                    <Box direction="row" gap="small">
                        <TextInput
                            value={`${window.location.origin}/solver/${templateStreamID}`}
                        />
                        <Button
                            icon={isSavedToClipboard ? <Check /> : <Copy />}
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `${window.location.origin}/solver/${templateStreamID}`
                                )
                                setIsSavedToClipboard(true)
                            }}
                        />
                    </Box>
                </Box>
                <TwoButtonWrapContainer
                    primaryButton={
                        <Link
                            href={`${window.location.origin}/solver/${templateStreamID}`}
                            passHref
                        >
                            <Button
                                primary
                                label="View template"
                                size="small"
                            />
                        </Link>
                    }
                    secondaryButton={
                        <Link
                            href={`${window.location.origin}/template/edit/${templateStreamID}`}
                            passHref
                        >
                            <Button
                                secondary
                                label="Edit template"
                                size="small"
                            />
                        </Link>
                    }
                />
            </Box>
        </>
    )
}

export default TemplatePublishStep
