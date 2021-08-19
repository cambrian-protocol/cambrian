pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SolverFactory.sol";
import "./Solver.sol";
import "./Minion.sol";
import "./ConditionalTokens.sol";
import "./interfaces/ISolver.sol";
import "./ProposalsHub.sol";
import "hardhat/console.sol";

contract SolutionsHub {
    uint256 nonce;
    ConditionalTokens public conditionalTokens;

    struct Solution {
        bool executed;
        IERC20 collateralToken;
        address keeper;
        address proposalHub;
        bytes32 proposalId;
        bytes32 id;
        Solver.Config[] solverConfigs;
        address[] solverAddresses;
    }

    mapping(bytes32 => Solution) solutions;
    mapping(address => bytes32) solverSolutionMap;

    modifier onlyKeeper(bytes32 _solutionId) {
        require(
            msg.sender == solutions[_solutionId].keeper,
            "SolutionsHub: onlyKeeper"
        );
        _;
    }

    event CreateSolution(bytes32 id);

    constructor(ConditionalTokens _conditionalTokens) {
        conditionalTokens = _conditionalTokens;
    }

    function linkToProposal(bytes32 _proposalId, bytes32 _solutionId) external {
        require(
            ProposalsHub(msg.sender).isProposal(_proposalId),
            "Proposal is not valid at proposalHub"
        );
        solutions[_solutionId].proposalHub = msg.sender;
        solutions[_solutionId].proposalId = _proposalId;
    }

    function executeSolution(bytes32 _proposalId, bytes32 _solutionId)
        external
    {
        require(
            msg.sender == solutions[_solutionId].proposalHub,
            "Not correct proposalHub"
        );
        require(
            solutions[_solutionId].proposalId == _proposalId,
            "Wrong proposalId"
        );

        require(
            solutions[_solutionId].executed == false,
            "Solution already executed"
        );
        solutions[_solutionId].executed = true;

        for (uint256 i; i < solutions[_solutionId].solverConfigs.length; i++) {
            SolverFactory _factory = solutions[_solutionId]
                .solverConfigs[i]
                .factory;

            address _solver = _factory.createSolver({
                _collateralToken: solutions[_solutionId].collateralToken,
                _solutionId: _solutionId,
                _proposalsHub: solutions[_solutionId].proposalHub,
                _solutionsHub: address(this),
                _solverConfig: solutions[_solutionId].solverConfigs[i]
                // _keeper: solutions[_solutionId].solverConfigs[i].keeper
                // _arbiter: solutions[_solutionId].solverConfigs[i].arbiter,
                // _timelockHours: solutions[_solutionId]
                //     .solverConfigs[i]
                //     .timelockHours,
                // _actions: solutions[_solutionId].solverConfigs[i].actions,
                // _data: solutions[_solutionId].solverConfigs[i].data
            });

            console.logAddress(_solver);

            require(_solver != address(0), "Invalid address");

            solutions[_solutionId].solverAddresses.push(_solver);
            solverSolutionMap[_solver] = _solutionId;
        }

        ProposalsHub(msg.sender).approveERC20Transfer(
            _proposalId,
            solutions[_solutionId].solverAddresses[0]
        );

        for (uint256 i; i < solutions[_solutionId].solverConfigs.length; i++) {
            ISolver _solver = ISolver(
                solutions[_solutionId].solverAddresses[i]
            );
            console.logAddress(solutions[_solutionId].solverAddresses[i]);
            _solver.executeSolve();
        }
    }

    function solverFromIndex(bytes32 _solutionId, uint256 _index)
        external
        view
        returns (address solver)
    {
        return solutions[_solutionId].solverAddresses[_index];
    }

    function createSolution(
        IERC20 _collateralToken,
        Solver.Config[] calldata _solverConfigs
    ) external returns (bytes32 _solutionId) {
        nonce++;
        bytes32 _id = keccak256(abi.encodePacked(msg.sender, nonce));
        Solution storage solution = solutions[_id];

        solution.id = _id;
        solution.keeper = msg.sender;
        solution.collateralToken = _collateralToken;

        for (uint256 i; i < _solverConfigs.length; i++) {
            solution.solverConfigs.push(_solverConfigs[i]);
        }

        emit CreateSolution(_id);
        return _id;
    }

    function setSolverConfigs(
        bytes32 _solutionId,
        Solver.Config[] calldata _solverConfigs
    ) external onlyKeeper(_solutionId) {
        delete solutions[_solutionId].solverConfigs;
        for (uint256 i; i < _solverConfigs.length; i++) {
            solutions[_solutionId].solverConfigs.push(_solverConfigs[i]);
        }
    }

    function getSolution(bytes32 _id)
        external
        view
        returns (Solution memory solution)
    {
        return solutions[_id];
    }
}
