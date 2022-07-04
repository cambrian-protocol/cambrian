import { Anchor, Box, Button, Text } from 'grommet'
import { Check, Copy, Eye, Pen, Trash } from 'phosphor-react'
import { useEffect, useState } from 'react'

interface ProposalListItemProps {
    proposalID: string
    proposalStreamID: string
    onDelete: (proposalID: string) => Promise<void>
}

// TODO Styling
const ProposalListItem = ({
    proposalID,
    proposalStreamID,
    onDelete,
}: ProposalListItemProps) => {
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
        <Box
            border
            flex
            height={{ min: 'auto' }}
            pad={{
                horizontal: 'medium',
                vertical: 'small',
            }}
            direction="row"
            justify="between"
            align="center"
            round="xsmall"
        >
            <Text>{proposalID}</Text>
            <Box direction="row">
                <Anchor href={`/dashboard/proposals/edit/${proposalStreamID}`}>
                    <Button icon={<Pen />} />
                </Anchor>
                <Anchor href={`/proposals/${proposalStreamID}`}>
                    <Button icon={<Eye />} />
                </Anchor>
                <Button icon={<Trash />} onClick={() => onDelete(proposalID)} />
                <Button
                    icon={isSavedToClipboard ? <Check /> : <Copy />}
                    onClick={() => {
                        navigator.clipboard.writeText(
                            `${window.location.origin}/proposals/${proposalStreamID}`
                        )
                        setIsSavedToClipboard(true)
                    }}
                />
            </Box>
        </Box>
    )
}

export default ProposalListItem
