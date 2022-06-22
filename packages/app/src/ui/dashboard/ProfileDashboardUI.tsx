import { Box, Button, Form, FormField, Heading, Text, TextArea } from 'grommet'
import { useEffect, useState } from 'react'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { SelfID } from '@self.id/framework'
import { UserType } from '@cambrian/app/store/UserContext'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface ProfileDashboardUIProps {
    currentUser: UserType
    selfID: SelfID
}

type ProfileFormType = {
    name: string
    title: string
    description: string
    email: string
    avatar: string
    company: string
    website: string
    twitter: string
}

const initalInput = {
    name: '',
    title: '',
    description: '',
    email: '',
    avatar: '',
    company: '',
    website: '',
    twitter: '',
}

const ProfileDashboardUI = ({
    currentUser,
    selfID,
}: ProfileDashboardUIProps) => {
    const { initSelfID } = useCurrentUser()
    const [input, setInput] = useState<ProfileFormType>(initalInput)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setInput({ ...initalInput, ...currentUser.basicProfile })
    }, [currentUser])

    const onSave = async () => {
        setIsSaving(true)
        try {
            await selfID.merge('basicProfile', input)
            initSelfID(selfID)
        } catch (e) {}
        setIsSaving(false)
    }

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
                    {currentUser.basicProfile?.avatar ? (
                        <BaseAvatar
                            size="large"
                            pfpPath={currentUser.basicProfile.avatar as string}
                        />
                    ) : (
                        <BaseAvatar
                            size="large"
                            address={currentUser.address}
                        />
                    )}
                    <Box gap="small">
                        <Heading>
                            {currentUser.basicProfile?.name || 'Anonym'}
                        </Heading>
                        <Text>
                            {(currentUser.basicProfile?.title as string) ||
                                'Unknown'}
                        </Text>
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
                                width={{ min: 'auto' }}
                            >
                                <Button
                                    size="small"
                                    secondary
                                    label="Reset"
                                    onClick={() =>
                                        setInput({
                                            ...initalInput,
                                            ...currentUser.basicProfile,
                                        })
                                    }
                                />
                                <LoaderButton
                                    onClick={onSave}
                                    isLoading={isSaving}
                                    primary
                                    label="Save"
                                />
                            </Box>
                        </Box>
                        <PlainSectionDivider />
                    </Box>
                    <Form<ProfileFormType>
                        onChange={(nextValue: ProfileFormType) => {
                            setInput(nextValue)
                        }}
                        value={input}
                    >
                        <FormField label="Name" name="name" />
                        <FormField label="Title" name="title" />
                        <Box>
                            <FormField label="Bio" name="description">
                                <TextArea
                                    name="description"
                                    rows={5}
                                    resize={false}
                                    maxLength={420}
                                />
                            </FormField>
                            <Text color="dark-4" size="small" textAlign="end">
                                {input.description.length}/420
                            </Text>
                        </Box>
                        <FormField
                            label="Avatar URL"
                            name="avatar"
                            placeholder="https://your.profile.picture"
                        />
                        <FormField label="Email Address" name="email" />
                        <FormField label="Company" name="company" />
                        <FormField label="Website" name="website" />
                        <FormField label="Twitter" name="twitter" />
                    </Form>
                </Box>
                <Box pad="large" />
            </Box>
        </DashboardLayout>
    )
}

export default ProfileDashboardUI
