// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "@pwnednomore/contracts/PTest.sol";
import "../../../contracts/solvers/SolverFactory.sol";
import "../../../contracts/solvers/SolverLib.sol";
import "../../../contracts/solvers/BasicSolverV1.sol";
import "../../../contracts/solvers/ERC1155Rescue.sol";
import "../../../contracts/interfaces/ISolver.sol";
import "../../../contracts/tokens/ToyToken.sol";
import "../../../contracts/conditionalTokens/ConditionalTokens.sol";
import "../../../contracts/modules/Modulated.sol";
import "../../../contracts/arbitration/ArbitratorFactory.sol";
import "../../../contracts/arbitration/BasicArbitrator.sol";

contract SolverTest is PTest {
    address buyer = address(0xcafebabe1);
    address seller = address(0xcafebabe2);
    address keeper = address(0x1234);
    address arbitrator = address(0x2333);

    ConditionalTokens ctf;
    SolverFactory solverFactory;
    BasicSolverV1 basicSolverV1;
    ERC1155Rescue erc1155rescue;
    ToyToken toyToken;
    SolverLib.ConditionBase conditionBase;
    ArbitratorFactory arbitratorFactory;
    BasicSolverV1[] solvers;
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

        toyToken.mint(address(buyer), 100);

        allocations[0].recipientAddressSlot = bytes32(uint256(1));
        allocations[0].recipientAmountSlots = [
            bytes32(uint256(3)),
            bytes32(uint256(4))
        ];

        allocations[1].recipientAddressSlot = bytes32(uint256(2));
        allocations[1].recipientAmountSlots = [
            bytes32(uint256(4)),
            bytes32(uint256(3))
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

        Modulated.Loader[] memory loaders = new Modulated.Loader[](0);
        SolverLib.Ingest[] memory ingests = new SolverLib.Ingest[](5);
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
            data: abi.encode(address(buyer))
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
            data: abi.encode(uint256(10000))
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
        vm.prank(keeper);
        deploySolverChain(config);
        //console.log("result: %s", aaa);

        vm.prank(buyer);
        toyToken.transfer(address(solvers[0]), 100);

        vm.startPrank(keeper);
        solvers[0].prepareSolve(0);
        solvers[0].executeSolve(0);

        uint256[] memory _payouts = new uint256[](2);
        _payouts[0] = 1;
        _payouts[1] = 0;
        solvers[0].proposePayouts(0, _payouts);

        //SolverLib.Condition[] memory conditionsProposed = solvers[0].getConditions();
        //uint256[] memory payouts = conditionsProposed[conditionsProposed.length-1].payouts;
        // assertEq(payouts[0], 1);
        // assertEq(payouts[1], 0);

        vm.warp(block.timestamp + 1);
        solvers[0].confirmPayouts(0);
        vm.stopPrank();
    }

    function deploySolverChain(SolverLib.Config[] memory solverConfigs) public {
        address _solverAddress;

        for (uint256 i; i < solverConfigs.length; i++) {
            if (i == 0) {
                _solverAddress = solverFactory.createSolver(
                    address(0),
                    i,
                    solverConfigs[i]
                );

                require(
                    _solverAddress != address(0),
                    "Invalid address for Solver"
                );
            } else {
                _solverAddress = Solver(_solverAddress).deployChild(
                    solverConfigs[i]
                );
            }
            solvers.push(BasicSolverV1(_solverAddress));
        }
    }

    /*
    function testSolver() public {
        vm.prank(buyer);
        toyToken.transfer(address(solvers[0]), 100);

        vm.startPrank(keeper);
        solvers[0].prepareSolve(0);
        solvers[0].executeSolve(0);

        SolverLib.Condition[] memory conditions = solvers[0].getConditions();

        uint256 indexSetSuccess = 1;
        uint256 indexSetFailure = 2;

        uint256[] memory _payouts = new uint256[](2);
        _payouts[0] = 1;
        _payouts[1] = 0;
        solvers[0].proposePayouts(0, _payouts);

        SolverLib.Condition[] memory conditionsProposed = solvers[0].getConditions();
        uint256[] memory payouts = conditionsProposed[conditionsProposed.length-1].payouts;
        assertEq(payouts[0], 1);
        assertEq(payouts[1], 0);

        vm.warp(block.timestamp+1);
        solvers[0].confirmPayouts(0);
        vm.stopPrank();

        uint256[] memory indexSets = new uint256[](2);
        indexSets[0] = indexSetSuccess;
        indexSets[1] = indexSetFailure;

        vm.prank(seller);
        ctf.redeemPositions(IERC20(address(toyToken)), bytes32(uint256(0)), conditions[conditions.length-1].conditionId, indexSets);

        assertEq(toyToken.balanceOf(seller), 100);
    }
        */
}
