import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import BaseSlotInputItem from '../list/BaseSlotInputItem'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'

type RecipientsModalProps = BaseLayerModalProps & {}

// TODO Map Recipients
const RecipientsModal = (props: RecipientsModalProps) => {
    return (
        <BaseLayerModal {...props}>
            <HeaderTextSection
                title="Recipients"
                subTitle="Short description"
                paragraph="Recipients description. Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
            />
            <Box gap="medium" fill>
                <BaseSlotInputItem
                    label="Keeper"
                    title="Henso.eth"
                    subTitle="0x0918019579187501985918750"
                />
                <BaseSlotInputItem
                    label="Arbitrator"
                    title="Henso.eth"
                    subTitle="0x0918019579187501985918750"
                />
                <BaseSlotInputItem
                    label="Others"
                    title="Henso.eth"
                    subTitle="0x0918019579187501985918750"
                />
                <BaseSlotInputItem
                    title="Henso.eth"
                    subTitle="0x0918019579187501985918750"
                />
                <BaseSlotInputItem
                    title="Henso.eth"
                    subTitle="0x0918019579187501985918750"
                />
                <BaseSlotInputItem
                    title="Henso.eth"
                    subTitle="0x0918019579187501985918750"
                />
                <BaseSlotInputItem
                    title="Henso.eth"
                    subTitle="0x0918019579187501985918750"
                />
                <BaseSlotInputItem
                    title="Henso.eth"
                    subTitle="0x0918019579187501985918750"
                />
                <BaseSlotInputItem
                    title="Henso.eth"
                    subTitle="0x0918019579187501985918750"
                />
                <BaseSlotInputItem
                    title="Henso.eth"
                    subTitle="0x0918019579187501985918750"
                />
                <BaseSlotInputItem
                    title="Henso.eth"
                    subTitle="0x0918019579187501985918750"
                />
            </Box>
        </BaseLayerModal>
    )
}

export default RecipientsModal
