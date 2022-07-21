import { Box, Button } from 'grommet'
import { ClipboardText, File, TreeStructure } from 'phosphor-react'

import CambrianLogo from '../branding/CambrianLogo'
import { Header } from 'grommet'
import Link from 'next/link'
import UserMenu from '../menu/UserMenu'

const Appbar = () => {
    return (
        <Header
            sticky="scrollup"
            pad={{ horizontal: 'large' }}
            background="background-back"
            fill="horizontal"
        >
            <Box
                style={{ position: 'relative' }}
                border={{ side: 'bottom' }}
                direction="row"
                flex
                justify="between"
                align="center"
                gap="small"
            >
                <CambrianLogo />
                <Box flex />
                {/*      <ThemeToogleButton /> */}
                <Link href={'/dashboard/templates'} passHref>
                    <Button
                        icon={<File />}
                        tip={{
                            content: 'Templates',
                            dropProps: { align: { top: 'bottom' } },
                        }}
                    />
                </Link>
                <Link href={'/dashboard/proposals'} passHref>
                    <Button
                        icon={<ClipboardText />}
                        tip={{
                            content: 'Proposals',
                            dropProps: { align: { top: 'bottom' } },
                        }}
                    />
                </Link>
                <Link href={'/dashboard/compositions'} passHref>
                    <Button
                        icon={<TreeStructure />}
                        tip={{
                            content: 'Compositions',
                            dropProps: { align: { top: 'bottom' } },
                        }}
                    />
                </Link>
                <UserMenu />
            </Box>
        </Header>
    )
}

export default Appbar
