import BaseContentSection from '@cambrian/app/components/sections/BaseContentSection'
import { Box } from 'grommet'
import CodeMirror from '@uiw/react-codemirror'
import CreateTemplateDetailStep from '@cambrian/app/ui/templates/forms/steps/CreateTemplateDetailStep'
import EnderSection from '@cambrian/app/components/sections/EnderSection'
import Glow from '@cambrian/app/components/branding/Glow'
import { Image } from 'grommet'
import IndexHeaderSection from '@cambrian/app/components/sections/IndexHeaderSection'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import RecommendedReadingsSection from '@cambrian/app/components/sections/RecommendedReadingsSection'
import { Text } from 'grommet'
import USPListSection from '@cambrian/app/components/sections/USPListSection'
import USPSection from '@cambrian/app/components/sections/USPSection'
import { useRef } from 'react'
import { useTheme } from '@cambrian/app/hooks/useTheme'

export default function Home() {
    const startRef = useRef<HTMLDivElement | null>(null)
    const { themeMode } = useTheme()

    function handleClickHeaderCTA() {
        if (startRef) startRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <PageLayout contextTitle="Index">
            <Box style={{ position: 'relative', overflow: 'hidden' }} fill>
                <IndexHeaderSection onClickCTA={handleClickHeaderCTA} />
                <Box ref={startRef} />
                <Box style={{ position: 'relative', overflow: 'hidden' }}>
                    <Glow
                        height="1000px"
                        width="1000px"
                        left={'-30%'}
                        top={'30%'}
                    />
                    <Glow
                        height="1000px"
                        width="1000px"
                        left={'-20%'}
                        bottom={'20%'}
                    />
                    <Glow
                        height="1500px"
                        width="1500px"
                        left={'40%'}
                        bottom={'0%'}
                    />
                    <Glow
                        height="1500px"
                        width="1500px"
                        left={'40%'}
                        bottom={'40%'}
                    />
                    <Image
                        src="/images/logo/cambrian_protocol_logo.svg"
                        style={{
                            position: 'absolute',
                            top: '50vh',
                            right: '-300px',
                            opacity: 0.03,
                        }}
                        height="1000px"
                    />
                    <Box style={{ position: 'relative' }}>
                        <USPSection />
                        <USPListSection />
                        <BaseContentSection
                            title={'Quit a Boss'}
                            subTitle={'Everyone'}
                            paragraph="Discover how you can bring your talents to web3 network for yourself or within a decentralized cooperative*"
                            image={
                                <Box
                                    round="xsmall"
                                    height={'large'}
                                    width={'large'}
                                    border={{ size: 'medium', color: 'black' }}
                                    elevation="large"
                                    overflow="hidden"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <PageLayout contextTitle="Index" hideBanner>
                                        <Box pad={{ top: 'medium' }}>
                                            <CreateTemplateDetailStep
                                                input={{
                                                    pfp: '',
                                                    proposalRequest: '',
                                                    name: 'Chris',
                                                    title: 'Writing an article as a professional journalist',
                                                    description:
                                                        "I am a professional journalist and content marketer with over 16-years' expertise and can supply you with top-quality, original blog posts that are tailor-made according to your unique requirements and goals. I have published hundreds of articles in magazines and on news sites, blogs, and social platforms.",
                                                    askingAmount: 0,
                                                    denominationTokenAddress:
                                                        '',
                                                    preferredTokens: [],
                                                    allowAnyPaymentToken: false,
                                                    flexInputs: [],
                                                    discordWebhook: '',
                                                }}
                                                setInput={() => {}}
                                                stepperCallback={() => {}}
                                            />
                                        </Box>
                                    </PageLayout>
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
                                        theme={themeMode}
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
