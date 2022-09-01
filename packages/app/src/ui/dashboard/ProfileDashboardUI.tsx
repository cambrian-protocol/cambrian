import { Box, Button, Form, FormField, Heading, Text, TextArea } from 'grommet'
import {
    CambrianProfileType,
    UserType,
    initialCambrianProfile,
} from '@cambrian/app/store/UserContext'
import { useEffect, useState } from 'react'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'

interface ProfileDashboardUIProps {
    currentUser: UserType
}

const ProfileDashboardUI = ({ currentUser }: ProfileDashboardUIProps) => {
    const cambrianProfile = currentUser.cambrianProfileDoc.content
    const [input, setInput] = useState<CambrianProfileType>(
        initialCambrianProfile
    )
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setInput({
            ...initialCambrianProfile,
            ...currentUser.cambrianProfileDoc.content,
        })
    }, [currentUser])

    const onSave = async () => {
        setIsSaving(true)
        try {
            await currentUser.cambrianProfileDoc.update(input)
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
                    {cambrianProfile.avatar ? (
                        <BaseAvatar
                            size="large"
                            pfpPath={cambrianProfile.avatar}
                        />
                    ) : (
                        <BaseAvatar
                            size="large"
                            address={currentUser.address}
                        />
                    )}
                    <Box gap="small" pad={{ top: 'medium' }}>
                        <Heading>{cambrianProfile.name || 'Anon'}</Heading>
                        <Text>{cambrianProfile.title || 'Unknown'}</Text>
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
                    <Form<CambrianProfileType>
                        onChange={(nextValue: CambrianProfileType) => {
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
                                label="Discord Webhook"
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
                                            ...initialCambrianProfile,
                                            ...cambrianProfile,
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
