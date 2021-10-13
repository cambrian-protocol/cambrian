pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ISolverFactory.sol";
import "./Solver.sol";
import "./SolverLib.sol";
import "./interfaces/IProposalsHub.sol";

// 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 DEV_ADDRESS

contract IPFSSolutionsHub {
    struct Solution {
        bool executed;
        IERC20 collateralToken;
        address keeper;
        address proposalHub;
        bytes32 proposalId;
        bytes32 id;
        bytes32 solverConfigsHash;
        address[] solverAddresses;
    }

    mapping(bytes32 => Solution) public solutions;

    modifier onlyKeeper(bytes32 _solutionId) {
        require(
            msg.sender == solutions[_solutionId].keeper,
            "SolutionsHub: onlyKeeper"
        );
        _;
    }

    event CreateSolution(bytes32 id);

    function linkToProposal(bytes32 _proposalId, bytes32 _solutionId) external {
        require(
            IProposalsHub(msg.sender).isProposal(_proposalId),
            "Proposal is not valid at proposalHub"
        );
        solutions[_solutionId].proposalHub = msg.sender;
        solutions[_solutionId].proposalId = _proposalId;
    }

    function deploySolverChain(
        bytes32 _solutionId,
        SolverLib.Config[] calldata solverConfigs
    ) private {
        Solver _solver;

        for (uint256 i; i < solverConfigs.length; i++) {
            if (i == 0) {
                _solver = Solver(
                    ISolverFactory(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
                        .createSolver(address(0), i, solverConfigs[i])
                );
            } else {
                _solver = _solver.deployChild(solverConfigs[i]);
            }
            solutions[_solutionId].solverAddresses.push(address(_solver));
        }
    }

    function createSolution(
        bytes32 _id,
        IERC20 _collateralToken,
        SolverLib.Config[] calldata solverConfigs
    ) external returns (bytes32 _solutionId) {
        require(
            solutions[_id].id != _id,
            "SolutionsHub::This ID already exists"
        );

        Solution storage solution = solutions[_id];

        solution.id = _id;
        solution.keeper = msg.sender;
        solution.collateralToken = _collateralToken;
        solution.solverConfigsHash = keccak256(abi.encode(solverConfigs));
        emit CreateSolution(_id);
        return _id;
    }

    function executeSolution(
        bytes32 _proposalId,
        bytes32 _solutionId,
        SolverLib.Config[] calldata solverConfigs
    ) external {
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

        require(
            verifyHash(_solutionId, solverConfigs),
            "Incorrect SolverConfig content"
        );

        solutions[_solutionId].executed = true;

        deploySolverChain(_solutionId, solverConfigs);

        IProposalsHub(msg.sender).transferERC20(
            _proposalId,
            solutions[_solutionId].solverAddresses[0]
        );

        for (
            uint256 i;
            i < solutions[_solutionId].solverAddresses.length;
            i++
        ) {
            ISolver _solver = ISolver(
                solutions[_solutionId].solverAddresses[i]
            );
            _solver.setTrackingId(solutions[_solutionId].proposalId);
        }
        // Execute first Solver
        ISolver(solutions[_solutionId].solverAddresses[0]).prepareSolve(0);
        ISolver(solutions[_solutionId].solverAddresses[0]).executeSolve(0);
    }

    function verifyHash(
        bytes32 solutionId,
        SolverLib.Config[] memory solverConfigs
    ) public view returns (bool) {
        return
            solutions[solutionId].solverConfigsHash ==
            keccak256(abi.encode(solverConfigs));
    }

    function solverFromIndex(bytes32 _solutionId, uint256 _index)
        public
        view
        returns (address _address)
    {
        _address = solutions[_solutionId].solverAddresses[_index];
    }
}
