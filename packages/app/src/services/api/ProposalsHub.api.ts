import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import {
    PROPOSALS_HUB_ABI,
    PROPOSALS_HUB_ADDRESS,
} from '@cambrian/app/config/api/proposalshub.config'

import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { ethers } from 'ethers'
import { fetchTokenModelFromAddress } from './etherscan/ERC20TokenTransferEvents'

export type ProposalResponseType = {
    proposal: ProposalModel
}

// TODO Centralize ProposalsHub Contract?
// TODO Contract response types
export const ProposalsHubAPI = {
    defundProposal: async (
        proposalId: string,
        collateralTokenAddress: string,
        amount: number
    ) => {
        const { currentUser } = useCurrentUser()

        if (currentUser) {
            const proposalsHubContract = new ethers.Contract(
                PROPOSALS_HUB_ADDRESS,
                PROPOSALS_HUB_ABI,
                currentUser.signer
            )
            proposalsHubContract
                .connect(currentUser.signer)
                .defundProposal(proposalId, collateralTokenAddress, amount)
                .then((res: any) => {})
        }
    },
    fundProposal: async (
        proposalId: string,
        collateralTokenAddress: string,
        amount: number
    ) => {
        const { currentUser } = useCurrentUser()

        if (currentUser) {
            const proposalsHubContract = new ethers.Contract(
                PROPOSALS_HUB_ADDRESS,
                PROPOSALS_HUB_ABI,
                currentUser.signer
            )
            proposalsHubContract
                .connect(currentUser.signer)
                .fundProposal(proposalId, collateralTokenAddress, amount)
                .then((res: any) => {})
        }
    },
    getProposalFromProposalId: async (
        proposalId: string
    ): Promise<ProposalResponseType> => {
        // TODO fetch proposal data from ipfs
        // const response = await cambrianClient.get<ProposalResponseType>()

        // TODO fetch proposal from chain

        // proposalsHubContract.connect(currentSigner).get

        // Fetch collateralToken name and symbol
        const collateralToken = await fetchTokenModelFromAddress(
            '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'
        )

        // dummy
        const response = {
            data: {
                proposal: {
                    id: proposalId,
                    title: 'Uniswap Brand Update',
                    description:
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. ',
                    amount: 10000,
                    buyer: {
                        name: '@Uniswap',
                        pfp: 'https://pbs.twimg.com/profile_images/1242184851152928769/wG2eTAfD_400x400.jpg',
                    },
                    solution: {
                        id: 'dummy_solutionId',
                        isExecuted: false,
                        collateralToken: collateralToken,
                        keeper: '0x194ba7A048627fb546fCAFBA8a4e8cA3DB588239', // Account 1
                        proposalsHub: '0x918759185791918751',
                        proposalId: '',
                        solverConfigsHash: '0x918759185791918751',
                        solverConfigsCID: '0x918759185791918751',
                        solverAddresses: [''],
                        seller: {
                            name: '@banklessDAO',
                            pfp: 'https://pbs.twimg.com/profile_images/1389400052448247816/qsOU0pih_400x400.jpg',
                        },
                    },
                },
            },
        }

        return response.data
    },

    /*  createProposal: async (
        solutionId: string,
        collateralTokenAddress: string,
        title: string,
        descripition: string,
        amount: number
    ): Promise<CreateProposalReturnType | null> => {
        const { currentSigner } = useCurrentUserOrSigner()
        const [proposalsHub] = useProposalsHub()

        if (currentSigner && proposalsHub) {
            const tx = await proposalsHub
                .connect(currentSigner)
                .createProposal(
                    collateralTokenAddress,
                    SOLUTIONSHUB_ADDRESS,
                    amount,
                    solutionId
                )
            const receipt = await tx.wait()
            const iface = new ethers.utils.Interface([
                'event CreateProposal(bytes32 id)',
            ])
            const proposalId = iface.parseLog(receipt.logs[0]).args.id

            // POST Proposal data
            const IPFSProposalData = {
                solutionId: solutionId,
                proposalId: proposalId,
                title: title,
                descripition: descripition,
            }

            const res = await post(
                process.env.IPFS_ENDPOINT_URL,
                IPFSProposalData
            )
        } else {
            throw new Error('Error while creating Proposal.')
        }
        return null
    }, */
}
