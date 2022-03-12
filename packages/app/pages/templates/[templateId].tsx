import { useContext, useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { Box } from 'grommet'
import CreateProposalUI from '@cambrian/app/src/ui/solutions/common/CreateProposalUI'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { UserContext } from '@cambrian/app/store/UserContext'
import { useRouter } from 'next/dist/client/router'

export default function TemplatePage() {
    const user = useContext(UserContext)
    const router = useRouter()
    const ipfs = new IPFSAPI()
    const [currentTemplate, setCurrentTemplate] = useState<TemplateModel>()

    useEffect(() => {
        async function getLogin() {
            await user.login()
        }
        if (!user.currentProvider) {
            getLogin()
        } else {
            console.log(user.currentProvider)
        }
    }, [])

    useEffect(() => {
        getTemplate()
    }, [router])

    const getTemplate = async () => {
        try {
            const templateId = router.query.templateId as string
            if (templateId) {
                const template = (await ipfs.getFromCID(
                    templateId
                )) as TemplateModel
                if (template) {
                    console.log('Loaded template: ', template)
                    setCurrentTemplate(template)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    if (!currentTemplate) {
        // TODO LOADING
        return null
    }
    return (
        <>
            {currentTemplate && (
                <BaseLayout contextTitle="Create Proposal">
                    <Box justify="center" align="center" gap="small">
                        <CreateProposalUI template={currentTemplate} />
                    </Box>
                </BaseLayout>
            )}
        </>
    )
}
