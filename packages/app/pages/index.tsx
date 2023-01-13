import { ArrowsOut, Graph, Handshake, ShareNetwork } from 'phosphor-react'
import { Box, Image } from 'grommet'

import { BackgroundScrollSection } from '@cambrian/app/components/sections/BackgroundScrollSection'
import BaseContentSection from '@cambrian/app/components/sections/BaseContentSection'
import CodeMirror from '@uiw/react-codemirror'
import EnderSection from '@cambrian/app/components/sections/EnderSection'
import Glow from '@cambrian/app/components/branding/Glow'
import IndexHeaderSection from '@cambrian/app/components/sections/IndexHeaderSection'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { Text } from 'grommet'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const sections: BackgroundScrollSection[] = [
    {
        id: 'control',
        img: '/illustrations/grid.svg',
        title: 'Choice & Control',
        icon: <ArrowsOut />,
        subTitle:
            "Banks control your money. Government controls your identity. Tech companies control your information. You pay taxes and fees to use what's already yours.",
        text: 'Cambrian users are empowered by blockchain technology to manage their own identities, operate using the currencies of their choice, and leverage a growing suite of information technologies for their work and business — Without paying middlemen for their monopolies.',
        objectPosition: 'center',
    },
    {
        id: 'freedom',
        img: '/illustrations/wave.svg',
        title: 'Freedom & Stability',
        icon: <ShareNetwork />,
        subTitle:
            'Thousands of livelihoods disappear every day from censorship, deplatforming, and simple mistakes. Your access to the financial services and digital platforms you need is at constant risk of being shut off.',
        text: "Our technology is built on Ethereum, the world's leading smart contract network. Our software is kept running by thousands of independent operators around the world, making downtime and censorship next to impossible. Even we can't ban you.",
        objectPosition: 'center',
    },
    {
        id: 'consensus',
        img: '/illustrations/twinkle.svg',
        title: 'Consensus & Cooperation',
        icon: <Handshake />,
        subTitle:
            'Misalignment between the owning and working class breeds exploitative conditions and business practices. The future of work should be owned by the workers.',
        text: 'Cambrian is establishing a Autonomous Organization (DAO), an evolution of the platform cooperative, to own and govern the protocol. Our founding team will dissolve into the DAO, transferring our intellectual property and exiting to the community.',
        objectPosition: 'center',
    },
    {
        id: 'customizable',
        img: '/illustrations/coil.svg',
        icon: <Graph />,
        title: 'Extensible & Customizable',
        subTitle:
            'The world moves too fast for one solution, and no software is right for everyone. The future of work needs something better than generic escrow and bounty solutions.',
        text: "Our Solver technology is modular, composable, and easily extended by developers. More, we've built an entire no-code workflow for regular users to configure custom solutions — eliminating the engineering bottleneck to growth and adoption.",
        objectPosition: 'center',
    },
]

export default function Home() {
    const router = useRouter()
    const { currentUser } = useCurrentUserContext()

    function handleClickHeaderCTA() {
        router.push('/copywriter')
    }

    useEffect(() => {
        if (currentUser && currentUser.isSafeApp) router.push('/safe')
    }, [currentUser])

    return (
        <>
            <PageLayout contextTitle="Work is evolving" plain>
                <Box style={{ position: 'relative' }} fill>
                    <IndexHeaderSection onClickCTA={handleClickHeaderCTA} />
                    <Box>
                        <Glow
                            height="1000px"
                            width="1000px"
                            left={'-20%'}
                            bottom={'20%'}
                        />
                        <Box style={{ position: 'relative' }}>
                            {/* <BackgroundScroll sections={sections} /> */}
                            {/* <USPSection /> */}
                            <BaseContentSection
                                title={'Own Your Work'}
                                subTitle={''}
                                paragraph="Use your own smart contract that protects you and your work."
                                image={
                                    <Box
                                        round="xsmall"
                                        elevation="large"
                                        border
                                        overflow="hidden"
                                        height={'auto'}
                                    >
                                        <Image
                                            fit="contain"
                                            src="/images/template.png"
                                        />
                                    </Box>
                                }
                                anchor={
                                    <Text size="small">
                                        🟢 Live on Goerli Test Network
                                    </Text>
                                }
                            />
                            <BaseContentSection
                                align="right"
                                title={'Build a Solver'}
                                subTitle={''}
                                paragraph="Design a novel smart contract that improves peoples’ jobs and earn a share of DAO revenue."
                                image={
                                    <Box
                                        round="xsmall"
                                        width={'large'}
                                        height={'large'}
                                        elevation="large"
                                        overflow={{ vertical: 'auto' }}
                                    >
                                        <CodeMirror
                                            theme={'dark'}
                                            value={solverCode}
                                        />
                                    </Box>
                                }
                                anchor={
                                    <Text color="dark-4" size="small">
                                        *Open Source launch Q4 2022
                                    </Text>
                                }
                            />
                            <BaseContentSection
                                subTitle=""
                                title={'Evolve Work'}
                                paragraph="Create outcomes, load and connect Solvers, and define allocations to streamline or automate entire lines of business."
                                image={
                                    <Box
                                        round="xsmall"
                                        elevation="large"
                                        border
                                        overflow="hidden"
                                    >
                                        <Image
                                            fit="contain"
                                            src="/images/composer_preview.png"
                                        />
                                    </Box>
                                }
                                anchor={
                                    <Text color="dark-4" size="small">
                                        *Composer official launch Q4 2022
                                    </Text>
                                }
                            />
                            <EnderSection />
                            {/* <RecommendedReadingsSection /> */}
                        </Box>
                    </Box>
                </Box>
            </PageLayout>
        </>
    )
}

export async function getStaticProps() {
    return {
        props: { noWalletPrompt: true },
    }
}

const solverCode = `// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "./SolverLib.sol";
import "./Solver.sol";

contract WriterSolverV1 is Solver {
    address public writer;
    address public buyer;

    event SentMessage(string cid, address sender, bytes32 conditionId);
    event SubmittedWork(string cid, address submitter, bytes32 conditionId);

    function postroll(uint256 _index) internal override {
        (bytes32 _writer, bytes32 _buyer) = abi.decode(
            config.data,
            (bytes32, bytes32)
        );

        writer = abi.decode(datas.slots[_writer][_index], (address));
        buyer = abi.decode(datas.slots[_buyer][_index], (address));
    }

    function sendMessage(string calldata cid, bytes32 conditionId) external {
        require(
            msg.sender == config.keeper ||
                msg.sender == config.arbitrator ||
                msg.sender == writer ||
                msg.sender == buyer
        );
        emit SentMessage(cid, msg.sender, conditionId);
    }

    function submitWork(string calldata cid, bytes32 conditionId) external {
        require(msg.sender == writer, "Only Writer");
        require(
            conditions[conditions.length - 1].status ==
                SolverLib.Status.Executed,
            "Disabled"
        );
        emit SubmittedWork(cid, msg.sender, conditionId);
    }
}
`
