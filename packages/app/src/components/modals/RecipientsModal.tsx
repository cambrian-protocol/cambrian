import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import BaseSlotInputItem from '../list/BaseSlotInputItem'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'

type RecipientsModalProps = BaseLayerModalProps & {
    recipientAddresses: (string | undefined)[]
}

const RecipientsModal = ({
    recipientAddresses,
    ...rest
}: RecipientsModalProps) => {
    return (
        <BaseLayerModal {...rest}>
            <HeaderTextSection
                title="Recipients"
                subTitle="Short description"
                paragraph="Recipients description. Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
            />
            <Box gap="medium" fill>
                {recipientAddresses.map((recipientAddress, idx) => (
                    <BaseSlotInputItem key={idx} title={recipientAddress} />
                ))}
            </Box>
        </BaseLayerModal>
    )
}

export default RecipientsModal
