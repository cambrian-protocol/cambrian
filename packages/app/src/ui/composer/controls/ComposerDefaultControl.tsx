import { Cursor } from 'phosphor-react'
import SidebarCard from '@cambrian/app/components/cards/SidebarCard'
import SidebarCardBody from '@cambrian/app/components/cards/SidebarCardBody'
import SidebarCardHeader from '@cambrian/app/components/cards/SidebarCardHeader'
import { Text } from 'grommet'

const ComposerDefaultControl = () => {
    return (
        <SidebarCard>
            <SidebarCardHeader title="No Solver or Outcome selected" />
            <SidebarCardBody justify="center" align="center">
                <Cursor size="36" />
                <Text textAlign="center">
                    Please select a Solver or an Outcome you want to configure
                </Text>
            </SidebarCardBody>
        </SidebarCard>
    )
}

export default ComposerDefaultControl
