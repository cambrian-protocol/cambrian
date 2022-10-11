import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../BaseActionbar'
import { Button } from 'grommet'
import Link from 'next/link'

interface ProposalEditActionbarProps {
    proposalStreamID: string
    messenger?: JSX.Element
}

const ProposalEditActionbar = ({
    proposalStreamID,
    messenger,
}: ProposalEditActionbarProps) => {
    return (
        <BaseActionbar
            messenger={messenger}
            primaryAction={
                <Link
                    href={`${window.location.origin}/proposal/edit/${proposalStreamID}`}
                    passHref
                >
                    <Button label="Edit Proposal" primary size="small" />
                </Link>
            }
            info={{
                title: `Change requested`,
                subTitle: 'Please check out the chat for details',
                dropContent: (
                    <ActionbarItemDropContainer
                        title="Proposal change requested"
                        description="A change at your Proposal has been requested by the Template author. You can directly chat with him and agree to a new Proposal version."
                    />
                ),
            }}
        />
    )
}

export default ProposalEditActionbar
