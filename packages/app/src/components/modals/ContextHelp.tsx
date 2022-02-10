import { Box, Button } from 'grommet'

import BaseLayerModal from './BaseLayerModal'
import { DiscordLogo } from 'phosphor-react'
import HeaderTextSection from '../sections/HeaderTextSection'
import { useState } from 'react'

interface ContextHelpModalProps {
    onClose: () => void
}

type ContextHelpType = {
    title: string
    subTitle: string
    description: string
}

const defaultContextHelp = {
    title: 'Context Help Title',
    description:
        'Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.',
    subTitle: 'Context Descripiton',
}

const ContextHelpModal = ({ onClose }: ContextHelpModalProps) => {
    const [currentContextHelp, setCurrentContextHelp] =
        useState<ContextHelpType>(defaultContextHelp)

    return (
        <BaseLayerModal onClose={onClose}>
            <Box fill gap="small">
                <HeaderTextSection
                    title={currentContextHelp.title}
                    subTitle={currentContextHelp.subTitle}
                    paragraph={currentContextHelp.description}
                />
                <HeaderTextSection
                    subTitle="Not your answer?"
                    paragraph="We're here to help! Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.Lorem Ipsum dolor sit amet consectetur adipisicing elit."
                />
                <Button
                    href="https://discord.com/invite/mBsmFeqD?utm_source=Discord%20Widget&utm_medium=Connect"
                    primary
                    label="Reach out on Discord"
                    icon={<DiscordLogo />}
                />
            </Box>
        </BaseLayerModal>
    )
}

export default ContextHelpModal