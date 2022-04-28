import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box, Anchor } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import StoredIdItem from '@cambrian/app/components/list/StoredIdItem'
import { Text } from 'grommet'
import { loadIdsFromLocalStorage } from '@cambrian/app/utils/helpers/localStorageHelpers'

interface ExportCompositionModalProps {
    description: string
    link: string
    onClose: () => void
    title: string
    prefix: string
    keyId: string
}

const ExportSuccessModal = ({
    onClose,
    title,
    description,
    link,
    prefix,
    keyId,
}: ExportCompositionModalProps) => {
    const [storedExports, setStoredExports] = useState<
        { title: string; cid: string }[]
    >([])

    useEffect(() => {
        setStoredExports(loadIdsFromLocalStorage(prefix, keyId))
    }, [])

    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title={title}
                subTitle="Success"
                paragraph={description}
            />
            <Box margin={{ top: 'small', bottom: 'small' }} fill gap="small">
                <Text size="xsmall" color="dark-4">
                    <Anchor
                        target="_blank"
                        href="https://discord.gg/pZP4HNYrZs"
                    >
                        Join our Discord
                    </Anchor>{' '}
                    and use the "/watch {storedExports[0].cid}" command to
                    receive notification DMs.
                </Text>
            </Box>
            {storedExports.length > 0 ? (
                <>
                    <StoredIdItem
                        border
                        key={storedExports[0].cid}
                        route={link}
                        title={storedExports[0].title}
                        cid={storedExports[0].cid}
                    />
                    {storedExports.length > 1 && (
                        <Box margin={{ top: 'large' }} fill gap="small">
                            <Text size="small" color="dark-4">
                                Recent {prefix}
                            </Text>
                            {storedExports.map((template, idx) => {
                                if (idx !== 0) {
                                    return (
                                        <StoredIdItem
                                            border={idx === 0}
                                            key={template.cid}
                                            route={link}
                                            title={template.title}
                                            cid={template.cid}
                                        />
                                    )
                                }
                            })}
                        </Box>
                    )}
                </>
            ) : (
                <></>
            )}
        </BaseLayerModal>
    )
}

export default ExportSuccessModal
