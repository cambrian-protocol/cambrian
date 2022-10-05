import { ArrowsOut, Graph, Handshake, ShareNetwork } from 'phosphor-react'
import BackgroundScroll, {
    BackgroundScrollSection,
} from '@cambrian/app/components/sections/BackgroundScrollSection'

import BaseContentSection from '@cambrian/app/components/sections/BaseContentSection'
import { Box } from 'grommet'
import CodeMirror from '@uiw/react-codemirror'
import EnderSection from '@cambrian/app/components/sections/EnderSection'
import Glow from '@cambrian/app/components/branding/Glow'
import { Image } from 'grommet'
import IndexHeaderSection from '@cambrian/app/components/sections/IndexHeaderSection'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import RecommendedReadingsSection from '@cambrian/app/components/sections/RecommendedReadingsSection'
import { Text } from 'grommet'
import USPSection from '@cambrian/app/components/sections/USPSection'

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
    function handleClickHeaderCTA() {
        document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
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
                        <BackgroundScroll sections={sections} />
                        <USPSection />
                        <BaseContentSection
                            title={'Quit a Boss'}
                            subTitle={'Everyone'}
                            paragraph="Discover how you can bring your talents to web3 network for yourself or within a decentralized cooperative*"
                            image={
                                <Box
                                    round="xsmall"
                                    elevation="large"
                                    border
                                    overflow="hidden"
                                >
                                    <Image src="/images/template.png" />
                                </Box>
                            }
                            anchor={
                                <Text size="small">
                                    🟢 Live on Ropsten Test Network
                                </Text>
                            }
                        />
                        <BaseContentSection
                            align="right"
                            title={'Build a Solver'}
                            subTitle={'Developers'}
                            paragraph="Learn how to build your own Solver, contribute to an Open Source Project in TypeScript and Solidity and create new opportunity for millions of people at a time. "
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
                            subTitle="Entrepreneurs"
                            title={'Market a Solution'}
                            paragraph="Create outcomes, load and connect Solvers, define allocations and compose complete business solutions powered by smart contracts with our intuitive no-code editor*"
                            image={
                                <Box
                                    round="xsmall"
                                    elevation="large"
                                    border
                                    overflow="hidden"
                                >
                                    <Image src="/images/composer_preview.png" />
                                </Box>
                            }
                            anchor={
                                <Text color="dark-4" size="small">
                                    *Composer official launch Q4 2022
                                </Text>
                            }
                        />
                        <EnderSection />
                        <RecommendedReadingsSection />
                    </Box>
                </Box>
            </Box>
        </PageLayout>
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
