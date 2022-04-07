import { useEffect, useState } from 'react'

import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import { CircleDashed } from 'phosphor-react'
import HeaderTextSection from '../sections/HeaderTextSection'
import StoredIdItem from '../list/StoredIdItem'
import { Text } from 'grommet'
import { loadIdsFromLocalStorage } from '@cambrian/app/utils/helpers/localStorageHelpers'

interface RecentTemplatesModalProps {
    title: string
    subTitle: string
    paragraph: string
    onClose: () => void
    prefix: string
    keyCID: string
    route: string
}

const RecentExportsModal = ({
    onClose,
    keyCID,
    route,
    prefix,
    title,
    subTitle,
    paragraph,
}: RecentTemplatesModalProps) => {
    const [storedExports, setStoredExports] = useState<
        { title: string; cid: string }[]
    >([])

    useEffect(() => {
        setStoredExports(loadIdsFromLocalStorage(prefix, keyCID))
    }, [])

    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                subTitle={title}
                title={subTitle}
                paragraph={paragraph}
            />
            <Box gap="small" fill>
                {storedExports.length > 0 ? (
                    storedExports.map((template) => (
                        <StoredIdItem
                            key={template.cid}
                            route={route}
                            title={template.title}
                            cid={template.cid}
                        />
                    ))
                ) : (
                    <Box fill justify="center" align="center" gap="medium">
                        <CircleDashed size="48" />
                        <Text color="dark-4" size="small">
                            No exported {prefix} found in local storage
                        </Text>
                    </Box>
                )}
            </Box>
        </BaseLayerModal>
    )
}

export default RecentExportsModal
