// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/ISolverFactory.sol";
import "../interfaces/IProposalsHub.sol";
import "../solvers/Solver.sol";
import "../solvers/SolverLib.sol";

import "hardhat/console.sol";

contract IPFSSolutionsHub {
    mapping(bytes32 => uint256) public nonces;

    ISolverFactory immutable solverFactory;
    IProposalsHub immutable proposalsHub;

    struct Base {
        IERC20 collateralToken;
        bytes32 id;
        bytes32 solverConfigsHash;
        string solverConfigsURI;
    }

    struct Instance {
        bool executed;
        bytes32 id;
        bytes32 baseId;
        address[] solverAddresses;
    }

    struct Solution {
        bool executed;
        IERC20 collateralToken;
        address proposalsHub;
        bytes32 proposalId;
        bytes32 id;
        bytes32 solverConfigsHash;
        string solverConfigsURI;
        address[] solverAddresses;
    }

    mapping(bytes32 => Base) public bases;
    mapping(bytes32 => Instance) public instances;

    mapping(bytes32 => bytes32) public instanceId_to_ProposalId;

    event CreateBase(bytes32 id);
    event CreateSolution(bytes32 id);
    event ExecuteSolution(bytes32 id);

    constructor(
        ISolverFactory factoryAddress,
        IProposalsHub proposalsHubAddress
    ) {
        solverFactory = factoryAddress;
        proposalsHub = proposalsHubAddress;
    }

    function linkToProposal(
        bytes32 proposalId,
        bytes32 solutionId,
        IERC20 collateralToken
    ) external {
        require(
            proposalsHub.isProposal(proposalId),
            "Proposal is not valid at proposalsHub"
        );
        require(
            bases[instances[solutionId].baseId].collateralToken ==
                collateralToken,
            "Wrong collateral token"
        );

        instanceId_to_ProposalId[solutionId] = proposalId;
    }

    function deploySolverChain(
        bytes32 _solutionId,
        SolverLib.Config[] calldata solverConfigs
    ) private {
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
            instances[_solutionId].solverAddresses.push(_solverAddress);
        }
    }

    // Ceramic Interop: baseId == keccak256(abi.encode(templateCommitID, proposalCommitID))
    function createBase(
        bytes32 baseId,
        IERC20 collateralToken,
        SolverLib.Config[] calldata solverConfigs,
        string calldata solverConfigsURI
    ) public returns (bytes32 safeBaseId) {
        nonces[baseId]++;
        safeBaseId = keccak256(abi.encode(baseId, nonces[baseId]));

        require(bases[safeBaseId].id != safeBaseId, "Base ID already exists");

        Base storage base = bases[safeBaseId];
        base.id = safeBaseId;
        base.collateralToken = collateralToken;
        base.solverConfigsHash = keccak256(abi.encode(solverConfigs));
        base.solverConfigsURI = solverConfigsURI;
        emit CreateBase(safeBaseId);
    }

    function createInstance(bytes32 baseId)
        public
        returns (bytes32 solutionId)
    {
        nonces[baseId]++;

        bytes32 instanceId = keccak256(
            abi.encode(baseId, nonces[baseId], blockhash(block.number - 1))
        );
        require(
            instances[instanceId].id != instanceId,
            "Instance ID already exists"
        );
        require(bases[baseId].id != bytes32(""), "Base not found");

        Instance storage instance = instances[instanceId];
        instance.id = instanceId;
        instance.baseId = baseId;

        emit CreateSolution(instanceId);
        return instanceId;
    }

    function createSolution(
        bytes32 baseId,
        IERC20 collateralToken,
        SolverLib.Config[] calldata solverConfigs,
        string calldata solverConfigsURI
    ) public returns (bytes32 instanceId) {
        require(
            instances[instanceId].id != instanceId,
            "SolutionsHub::Instance ID already exists"
        );
        createBase(baseId, collateralToken, solverConfigs, solverConfigsURI);
        instanceId = createInstance(baseId);

        emit CreateSolution(instanceId);
    }

    function executeSolution(
        bytes32 proposalId,
        bytes32 solutionId,
        SolverLib.Config[] calldata solverConfigs
    ) external {
        require(
            verifyHash(instances[solutionId].baseId, solverConfigs),
            "Incorrect SolverConfig content"
        );
        require(
            msg.sender == address(proposalsHub),
            "Not correct proposalsHub"
        );
        require(
            instanceId_to_ProposalId[solutionId] == proposalId,
            "Wrong proposalId"
        );
        require(
            instances[solutionId].executed == false,
            "Solution already executed"
        );

        instances[solutionId].executed = true;

        deploySolverChain(solutionId, solverConfigs);

        IProposalsHub(msg.sender).transferERC20(
            proposalId,
            instances[solutionId].solverAddresses[0]
        );

        for (uint256 i; i < instances[solutionId].solverAddresses.length; i++) {
            ISolver _solver = ISolver(instances[solutionId].solverAddresses[i]);
            _solver.setTrackingId(instanceId_to_ProposalId[solutionId]);
        }
        // Prepare first Solver
        ISolver(instances[solutionId].solverAddresses[0]).prepareSolve(0);

        try
            ISolver(instances[solutionId].solverAddresses[0]).executeSolve(0)
        {} catch {
            console.log("Oops");
        }

        emit ExecuteSolution(solutionId);
    }

    function verifyHash(bytes32 baseId, SolverLib.Config[] memory solverConfigs)
        public
        view
        returns (bool)
    {
        return
            bases[baseId].solverConfigsHash ==
            keccak256(abi.encode(solverConfigs));
    }

    function solverFromIndex(bytes32 solutionId, uint256 index)
        public
        view
        returns (address solverAddress)
    {
        if (instances[solutionId].solverAddresses.length > 0) {
            return instances[solutionId].solverAddresses[index];
        } else {
            return address(0);
        }
    }

    function getSolvers(bytes32 solutionId)
        public
        view
        returns (address[] memory solvers)
    {
        solvers = instances[solutionId].solverAddresses;
    }

    function getSolution(bytes32 instanceId)
        public
        view
        returns (Solution memory solution)
    {
        Instance memory instance = instances[instanceId];
        Base memory base = bases[instance.baseId];

        solution.id = instance.id;
        solution.executed = instance.executed;
        solution.collateralToken = base.collateralToken;
        solution.proposalId = instanceId_to_ProposalId[instanceId];
        solution.solverConfigsHash = base.solverConfigsHash;
        solution.solverConfigsURI = base.solverConfigsURI;
    }
}
