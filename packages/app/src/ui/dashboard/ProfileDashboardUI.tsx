import { Box, Button, Form, FormField, Heading, Text, TextArea } from 'grommet'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { UserType } from '@cambrian/app/store/UserContext'
import { useState } from 'react'

interface ProfileDashboardUIProps {
    currentUser: UserType
}

const ProfileDashboardUI = ({ currentUser }: ProfileDashboardUIProps) => {
    const [input, setInput] = useState()

    return (
        <DashboardLayout contextTitle="Dashboard">
            <Box
                fill
                gap="large"
                pad="large"
                width={{ max: 'large', min: 'large' }}
            >
                <Box
                    direction="row"
                    align="center"
                    height={{ min: 'auto' }}
                    gap="medium"
                >
                    <BaseAvatar size="large" address={currentUser.address} />
                    <Box gap="small">
                        <Heading>Unknown name</Heading>
                        <Text>Unknown title</Text>
                        <Text color="dark-4">{currentUser.address}</Text>
                    </Box>
                </Box>

                <Box gap="large" height={{ min: 'auto' }}>
                    <Box gap="small">
                        <Box direction="row" gap="small">
                            <Box gap="xsmall">
                                <Heading level="3">Profile Management</Heading>
                                <Text color="dark-4" size="small">
                                    Update your Web3 profile. We don’t store
                                    this data, it is saved to your decentralized
                                    ID and is tied to your wallet.
                                </Text>
                            </Box>
                            <Box
                                direction="row"
                                gap="medium"
                                justify="end"
                                alignSelf="end"
                                height={{ min: 'auto' }}
                            >
                                <Button secondary label="Reset" />
                                <Button primary label="Save" />
                            </Box>
                        </Box>
                        <PlainSectionDivider />
                    </Box>
                    <Form>
                        <FormField label="Name" />
                        <FormField label="Bio">
                            <TextArea rows={5} resize={false} />
                        </FormField>
                        <FormField label="Avatar URL" />
                        <FormField label="Email Address" />
                        <FormField label="Company" />
                        <FormField label="Website" />
                        <FormField label="Twitter" />
                    </Form>
                </Box>
                <Box pad="large" />
            </Box>
        </DashboardLayout>
    )
}

export default ProfileDashboardUI
