import { Box, Button, Form, FormField, Heading, Text, TextArea } from 'grommet'
import { useEffect, useState } from 'react'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface ProfileDashboardUIProps {
    currentUser: UserType
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
    discordWebhook: string
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
    discordWebhook: '',
}

const ProfileDashboardUI = ({ currentUser }: ProfileDashboardUIProps) => {
    const { initSelfID } = useCurrentUser()
    const [input, setInput] = useState<ProfileFormType>(initalInput)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setInput({ ...initalInput, ...currentUser.basicProfile })
    }, [currentUser])

    const onSave = async () => {
        setIsSaving(true)
        try {
            await currentUser.selfID.merge('basicProfile', input)
            initSelfID(currentUser.selfID)
        } catch (e) {}
        setIsSaving(false)
    }

    return (
        <PageLayout kind="narrow" contextTitle="Dashboard">
            <Box gap="large" pad="large">
                <Box
                    direction="row"
                    align="center"
                    gap="medium"
                    wrap
                    pad="xsmall"
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
                    <Box gap="small" pad={{ top: 'medium' }}>
                        <Heading>
                            {currentUser.basicProfile?.name || 'Anonym'}
                        </Heading>
                        <Text>
                            {(currentUser.basicProfile?.title as string) ||
                                'Unknown'}
                        </Text>
                        <Text color="dark-4">
                            {ellipseAddress(currentUser.address, 10)}
                        </Text>
                    </Box>
                </Box>
                <Box gap="medium">
                    <Box gap="small" pad="xsmall">
                        <Box gap="xsmall">
                            <Heading level="3">Profile Management</Heading>
                            <Text color="dark-4" size="small">
                                Update your Web3 profile. We don’t store this
                                data, it is saved to your decentralized ID and
                                tied to your wallet.
                            </Text>
                        </Box>
                        <PlainSectionDivider />
                    </Box>
                    <Form<ProfileFormType>
                        onChange={(nextValue: ProfileFormType) => {
                            setInput(nextValue)
                        }}
                        value={input}
                    >
                        <Box pad="xsmall">
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
                                <Text
                                    color="dark-4"
                                    size="small"
                                    textAlign="end"
                                >
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
                            <FormField
                                label="Dicord Webhook"
                                name="discordWebhook"
                            />
                        </Box>
                        <TwoButtonWrapContainer
                            primaryButton={
                                <LoaderButton
                                    onClick={onSave}
                                    isLoading={isSaving}
                                    primary
                                    label="Save"
                                />
                            }
                            secondaryButton={
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
                            }
                        />
                    </Form>
                </Box>
                <Box pad="large" />
            </Box>
        </PageLayout>
    )
}

export default ProfileDashboardUI
