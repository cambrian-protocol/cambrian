import { Box, Heading } from 'grommet'

import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'
import { SelfID } from '@self.id/framework'

interface DashboardUIProps {
    walletAddress: string
    selfID: SelfID
}

// TODO WIP
const DashboardUI = ({ walletAddress, selfID }: DashboardUIProps) => {
    return (
        <DashboardLayout contextTitle="Dashboard">
            <Box fill justify="center" align="center">
                <Heading>Dashboard</Heading>
            </Box>
        </DashboardLayout>
    )
}

export default DashboardUI

/* 
                const ceramicStagehand = new CeramicStagehand(selfID)
            
                const [templates, setTemplates] = useState()
                const [proposals, setProposals] = useState()
                const [compositions, setCompositions] =
                    useState<{ [key: string]: string }>()
            
                useEffect(() => {
                    init()
                }, [])
            
                const init = async () => {
                    const compositions = (await ceramicStagehand.loadStages(
                        StageNames.composition
                    )) as { [key: string]: string }
                    setCompositions(compositions)
            
                    const templates = (await ceramicStagehand.loadStages(
                        StageNames.template
                    )) as { [key: string]: string }
                }
             */
