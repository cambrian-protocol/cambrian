import { Box, Button, TextInput } from 'grommet'
import { Check, Copy } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import Link from 'next/link'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

const TemplatePublishStep = () => {
    const { template } = useTemplateContext()
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
            {template ? (
                <Box height={{ min: '60vh' }} justify="between">
                    <Box pad="xsmall">
                        <HeaderTextSection
                            title="Share your template"
                            paragraph="Spread the word and distibute your template to your future clients."
                        />
                        <Box direction="row" gap="small">
                            <TextInput
                                value={`${window.location.origin}/solver/${template.doc.streamID}`}
                            />
                            <Button
                                icon={isSavedToClipboard ? <Check /> : <Copy />}
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `${window.location.origin}/solver/${template.doc.streamID}`
                                    )
                                    setIsSavedToClipboard(true)
                                }}
                            />
                        </Box>
                    </Box>
                    <TwoButtonWrapContainer
                        primaryButton={
                            <Link
                                href={`${window.location.origin}/solver/${template.doc.streamID}`}
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
                                href={`${window.location.origin}/template/edit/${template.doc.streamID}`}
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
            ) : (
                <Box height="medium" gap="medium">
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                    <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                </Box>
            )}
        </>
    )
}

export default TemplatePublishStep
