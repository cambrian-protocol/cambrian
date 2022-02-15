import { useEffect, useState, useContext } from 'react'

import { Box } from 'grommet'
import CreateProposalUI from '@cambrian/app/src/ui/solutions/common/CreateProposalUI'
import { Layout } from '@cambrian/app/src/components/layout/Layout'
import { useRouter } from 'next/dist/client/router'
import { UserContext } from '@cambrian/app/store/UserContext'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'

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
                const template = await ipfs.getFromCID(templateId)
                if (template) {
                    console.log('Loaded template: ', JSON.parse(template))
                    setCurrentTemplate(JSON.parse(template))
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
                <Layout contextTitle="Create Proposal">
                    <Box justify="center" align="center" gap="small">
                        <CreateProposalUI template={currentTemplate} />
                    </Box>
                </Layout>
            )}
        </>
    )
}
