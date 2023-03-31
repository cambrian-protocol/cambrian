import { Box, Button, Form, FormField, Heading, Text, TextArea } from 'grommet'
import {
    CambrianProfileType,
    UserType,
    initialCambrianProfile,
} from '@cambrian/app/store/UserContext'
import { FloppyDisk, XCircle } from 'phosphor-react'
import { useEffect, useState } from 'react'

import API from '@cambrian/app/services/api/cambrian.api'
import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'

interface ProfileDashboardUIProps {
    currentUser: UserType
}

const ProfileDashboardUI = ({ currentUser }: ProfileDashboardUIProps) => {
    const [cambrianProfile, setCambrianProfile] = useState(
        currentUser.cambrianProfileDoc?.content
    )

    const [input, setInput] = useState<CambrianProfileType>(
        initialCambrianProfile
    )
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setInput({
            ...initialCambrianProfile,
            ...currentUser.cambrianProfileDoc?.content,
        })
    }, [currentUser])

    const onSave = async () => {
        setIsSaving(true)
        try {
            if (!currentUser.cambrianProfileDoc || !currentUser.session)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            await API.doc.updateStream(
                currentUser,
                currentUser.cambrianProfileDoc.streamID,
                input
            )
            setCambrianProfile(input)
        } catch (e) {}
        setIsSaving(false)
    }

    return (
        <Box fill gap="medium" pad={{ top: 'medium' }}>
            <DashboardHeader
                title="Profile Management"
                description="Update your Web3 profile. We don’t store this data,
                it is saved to your decentralized ID and tied to
                your wallet."
                controls={[
                    <Button
                        icon={<XCircle />}
                        secondary
                        label="Reset"
                        onClick={() =>
                            setInput({
                                ...initialCambrianProfile,
                                ...cambrianProfile,
                            })
                        }
                    />,
                    <LoaderButton
                        icon={<FloppyDisk />}
                        onClick={onSave}
                        isLoading={isSaving}
                        primary
                        label="Save"
                    />,
                ]}
            />
            <Box
                direction="row"
                align="center"
                gap="medium"
                pad={{ top: 'medium' }}
            >
                {cambrianProfile?.avatar ? (
                    <BaseAvatar size="large" pfpPath={cambrianProfile.avatar} />
                ) : (
                    <BaseAvatar size="large" address={currentUser.address} />
                )}
                <Box gap="small" pad={{ top: 'medium' }}>
                    <Heading>{cambrianProfile?.name || 'Anon'}</Heading>
                    <Text>{cambrianProfile?.title || 'Unknown'}</Text>
                    <Text color="dark-4">
                        {ellipseAddress(currentUser.address, 10)}
                    </Text>
                </Box>
            </Box>
            <Form<CambrianProfileType>
                onChange={(nextValue: CambrianProfileType) => {
                    setInput(nextValue)
                }}
                value={input}
            >
                <Box pad="xsmall" width={'large'}>
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
                </Box>
            </Form>

            <Box pad="large" />
        </Box>
    )
}

export default ProfileDashboardUI
