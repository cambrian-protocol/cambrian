import { Box, Button, Form, FormField, Heading, Text, TextArea } from 'grommet'
import {
    CambrianProfileType,
    initialCambrianProfile,
} from '@cambrian/app/store/UserContext'
import { useEffect, useState } from 'react'

import API from '@cambrian/app/services/api/cambrian.api'
import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

const ProfileDashboardUI = () => {
    const { currentUser, isUserLoaded, updateProfileDoc } =
        useCurrentUserContext()
    const [input, setInput] = useState<CambrianProfileType>(
        initialCambrianProfile
    )
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (currentUser) {
            setInput({
                ...initialCambrianProfile,
                ...currentUser.cambrianProfileDoc?.content,
            })
        }
    }, [isUserLoaded])

    const onSave = async () => {
        setIsSaving(true)
        try {
            if (
                !currentUser ||
                !currentUser.cambrianProfileDoc ||
                !currentUser.session
            )
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            const res = await API.doc.updateStream(
                currentUser,
                currentUser.cambrianProfileDoc.streamID,
                input
            )
            if (res?.status === 200) {
                updateProfileDoc({
                    ...currentUser.cambrianProfileDoc,
                    content: input,
                    commitID: res.commitID,
                })
            }
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
                        secondary
                        label="Reset"
                        onClick={() =>
                            setInput({
                                ...initialCambrianProfile,
                                ...currentUser?.cambrianProfileDoc?.content,
                            })
                        }
                    />,
                    <LoaderButton
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
                {currentUser?.cambrianProfileDoc?.content.avatar ? (
                    <BaseAvatar
                        size="large"
                        pfpPath={
                            currentUser?.cambrianProfileDoc?.content.avatar
                        }
                    />
                ) : (
                    <BaseAvatar size="large" address={currentUser?.address} />
                )}
                <Box gap="small" pad={{ top: 'medium' }}>
                    <Heading>
                        {currentUser?.cambrianProfileDoc?.content?.name ||
                            'Anon'}
                    </Heading>
                    <Text>
                        {currentUser?.cambrianProfileDoc?.content?.title ||
                            'Unknown'}
                    </Text>
                    <Text color="dark-4">
                        {ellipseAddress(currentUser?.address, 10)}
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
