// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.14;

import "forge-std/Test.sol";
import "@pwnednomore/contracts/PTest.sol";
import "../../../contracts/solvers/SolverFactory.sol";
import "../../../contracts/solvers/SolverLib.sol";
import "../../../contracts/solvers/BasicSolverV1.sol";
import "../../../contracts/solvers/ERC1155Rescue.sol";
import "../../../contracts/interfaces/ISolver.sol";
import "../../../contracts/interfaces/IProposalsHub.sol";
import "../../../contracts/interfaces/IIPFSSolutionsHub.sol";
import "../../../contracts/interfaces/ISolverFactory.sol";
import "../../../contracts/tokens/ToyToken.sol";
import "../../../contracts/conditionalTokens/ConditionalTokens.sol";
import "../../../contracts/modules/Modulated.sol";
import "../../../contracts/arbitration/ArbitratorFactory.sol";
import "../../../contracts/arbitration/BasicArbitrator.sol";
import "../../../contracts/hubs/ProposalsHub.sol";
import "../../../contracts/hubs/IPFSSolutionsHub.sol";

contract ProposalsHubTest is PTest {
    address buyer0 = address(0xcafebabe1);
    address buyer1 = address(0xcafebabe2);
    address seller = address(0xcafebabe3);
    address keeper = address(0x1234);
    address arbitrator = address(0x2333);

    ConditionalTokens ctf;
    SolverFactory solverFactory;
    BasicSolverV1 basicSolverV1;
    ERC1155Rescue erc1155rescue;
    ProposalsHub proposalsHub;
    IPFSSolutionsHub ipfsSolutionsHub;
    ToyToken toyToken;
    SolverLib.ConditionBase conditionBase;
    ArbitratorFactory arbitratorFactory;
    SolverLib.Allocation[2] allocations;

    address agent;

    function setUp() public {
        agent = getAgent();
        ctf = new ConditionalTokens();
        erc1155rescue = new ERC1155Rescue(ctf);
        solverFactory = new SolverFactory(address(ctf), address(erc1155rescue));
        basicSolverV1 = new BasicSolverV1();
        toyToken = new ToyToken("Toy", "TT");
        arbitratorFactory = new ArbitratorFactory();
        proposalsHub = new ProposalsHub(address(ctf));
        ipfsSolutionsHub = new IPFSSolutionsHub(
            ISolverFactory(address(solverFactory)),
            IProposalsHub(address(proposalsHub))
        );

        allocations[0].recipientAddressSlot = bytes32(uint256(1));
        allocations[0].recipientAmountSlots = [
            bytes32(uint256(5)),
            bytes32(uint256(6))
        ];

        allocations[1].recipientAddressSlot = bytes32(uint256(2));
        allocations[1].recipientAmountSlots = [
            bytes32(uint256(6)),
            bytes32(uint256(5))
        ];

        conditionBase.collateralToken = IERC20(address(toyToken));
        conditionBase.outcomeSlots = 2;
        conditionBase.parentCollectionIndexSet = 0;
        conditionBase.amountSlot = bytes32(uint256(4));
        conditionBase.partition = [1, 2];
        conditionBase.allocations = allocations;
        conditionBase.outcomeURIs = [
            "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ",
            "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP"
        ];
    }

    struct RefundTestStruct {
        uint256 fundingGoal;
        uint256 amount;
        uint256 eoaAmount;
        uint256 phubAmount;
        uint256 buyer0Funding;
        uint256 outcome0;
        uint256 outcome1;
    }

    function testRefunds(RefundTestStruct calldata refundTestStruct) public {
        vm.assume(refundTestStruct.fundingGoal <= 2**128);
        vm.assume(refundTestStruct.fundingGoal >= 2);
        vm.assume(refundTestStruct.amount <= 10000);
        vm.assume(refundTestStruct.eoaAmount < 10000);
        vm.assume(refundTestStruct.phubAmount < 10000);
        vm.assume(refundTestStruct.phubAmount != refundTestStruct.eoaAmount);
        vm.assume(
            refundTestStruct.phubAmount + refundTestStruct.eoaAmount <= 10000
        );
        vm.assume(
            refundTestStruct.buyer0Funding > 0 &&
                refundTestStruct.buyer0Funding < refundTestStruct.fundingGoal
        );
        vm.assume(refundTestStruct.outcome1 <= 10000);
        vm.assume(refundTestStruct.outcome1 > refundTestStruct.outcome0);

        Modulated.Loader[] memory loaders = new Modulated.Loader[](0);
        SolverLib.Ingest[] memory ingests = new SolverLib.Ingest[](7);
        ingests[0] = SolverLib.Ingest({
            executions: 0,
            ingestType: SolverLib.IngestType.Constant,
            slot: bytes32(uint256(0)),
            solverIndex: 0,
            data: abi.encode(bytes32(""))
        });
        ingests[1] = SolverLib.Ingest({
            executions: 0,
            ingestType: SolverLib.IngestType.Constant,
            slot: bytes32(uint256(1)),
            solverIndex: 0,
            data: abi.encode(address(proposalsHub))
        });
        ingests[2] = SolverLib.Ingest({
            executions: 0,
            ingestType: SolverLib.IngestType.Constant,
            slot: bytes32(uint256(2)),
            solverIndex: 0,
            data: abi.encode(address(seller))
        });
        ingests[3] = SolverLib.Ingest({
            executions: 0,
            ingestType: SolverLib.IngestType.Constant,
            slot: bytes32(uint256(3)),
            solverIndex: 0,
            data: abi.encode(uint256(0))
        });

        ingests[4] = SolverLib.Ingest({
            executions: 0,
            ingestType: SolverLib.IngestType.Constant,
            slot: bytes32(uint256(4)),
            solverIndex: 0,
            data: abi.encode(uint256(refundTestStruct.amount))
        });

        ingests[5] = SolverLib.Ingest({
            executions: 0,
            ingestType: SolverLib.IngestType.Constant,
            slot: bytes32(uint256(5)),
            solverIndex: 0,
            data: abi.encode(refundTestStruct.eoaAmount)
        });
        ingests[6] = SolverLib.Ingest({
            executions: 0,
            ingestType: SolverLib.IngestType.Constant,
            slot: bytes32(uint256(6)),
            solverIndex: 0,
            data: abi.encode(refundTestStruct.phubAmount)
        });

        SolverLib.Config[] memory config = new SolverLib.Config[](1);
        config[0] = SolverLib.Config({
            implementation: basicSolverV1,
            keeper: address(keeper),
            arbitrator: address(arbitrator),
            timelockSeconds: 0,
            moduleLoaders: loaders,
            ingests: ingests,
            conditionBase: conditionBase
        });

        (bytes32 solutionId, bytes32 proposalId) = proposalsHub
            .createIPFSSolutionAndProposal(
                bytes32("moloch"),
                toyToken,
                IIPFSSolutionsHub(address(ipfsSolutionsHub)),
                refundTestStruct.fundingGoal,
                config,
                "solverConfigsURI",
                "metadataURI"
            );

        toyToken.mint(address(buyer0), refundTestStruct.buyer0Funding);
        toyToken.mint(
            address(buyer1),
            refundTestStruct.fundingGoal - refundTestStruct.buyer0Funding
        );

        vm.startPrank(buyer0);
        toyToken.approve(address(proposalsHub), refundTestStruct.buyer0Funding);
        proposalsHub.fundProposal(
            proposalId,
            toyToken,
            refundTestStruct.buyer0Funding
        );
        vm.stopPrank();

        vm.startPrank(buyer1);
        toyToken.approve(
            address(proposalsHub),
            refundTestStruct.fundingGoal - (refundTestStruct.buyer0Funding)
        );
        proposalsHub.fundProposal(
            proposalId,
            toyToken,
            refundTestStruct.fundingGoal - (refundTestStruct.buyer0Funding)
        );
        vm.stopPrank();

        proposalsHub.executeIPFSProposal(proposalId, config);

        address[] memory solvers = ipfsSolutionsHub.getSolvers(solutionId);
        SolverLib.Condition[] memory conditions = ISolver(solvers[0])
            .getConditions();

        uint256 indexSetSuccess = 1;
        uint256 indexSetFailure = 2;

        uint256[] memory _payouts = new uint256[](2);
        _payouts[0] = refundTestStruct.outcome0;
        _payouts[1] = refundTestStruct.outcome1;

        vm.startPrank(keeper);
        ISolver(solvers[0]).proposePayouts(0, _payouts);

        SolverLib.Condition[] memory conditionsProposed = ISolver(solvers[0])
            .getConditions();
        uint256[] memory payouts = conditionsProposed[
            conditionsProposed.length - 1
        ].payouts;
        assertEq(payouts[0], refundTestStruct.outcome0);
        assertEq(payouts[1], refundTestStruct.outcome1);

        vm.warp(block.timestamp + 1);
        ISolver(solvers[0]).confirmPayouts(0);
        vm.stopPrank();

        uint256[] memory indexSets = new uint256[](2);
        indexSets[0] = indexSetSuccess;
        indexSets[1] = indexSetFailure;

        uint256 token0 = ctf.getPositionId(
            toyToken,
            ctf.getCollectionId(
                bytes32(""),
                conditions[0].conditionId,
                indexSetSuccess
            )
        );
        uint256 token1 = ctf.getPositionId(
            toyToken,
            ctf.getCollectionId(
                bytes32(""),
                conditions[0].conditionId,
                indexSetFailure
            )
        );

        // This is the real thing I want to check
        // The buyers who funded the proposal should both
        // be able to successfully call reclaimTokens
        vm.startPrank(buyer0);
        try proposalsHub.reclaimTokens(proposalId, token0) {} catch Error(
            string memory reason
        ) {
            assert(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("ProposalsHub::Claim is 0"))
            );
        }
        try proposalsHub.reclaimTokens(proposalId, token1) {} catch Error(
            string memory reason
        ) {
            assert(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("ProposalsHub::Claim is 0"))
            );
        }

        vm.stopPrank();

        vm.startPrank(buyer1);
        try proposalsHub.reclaimTokens(proposalId, token1) {} catch Error(
            string memory reason
        ) {
            assert(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("ProposalsHub::Claim is 0"))
            );
        }
        try proposalsHub.reclaimTokens(proposalId, token1) {} catch Error(
            string memory reason
        ) {
            assert(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("ProposalsHub::Claim is 0"))
            );
        }
        vm.stopPrank();
    }
}
