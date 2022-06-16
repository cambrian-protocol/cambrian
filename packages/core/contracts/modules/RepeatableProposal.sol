// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.14;

import "../solvers/SolverLib.sol";
import "../interfaces/ISolver.sol";
import "./Module.sol";

import "../interfaces/IProposalsHub.sol";

import "../hubs/ProposalsHub.sol";

contract RepeatableProposal is Module {
    IProposalsHub public immutable proposalsHub;

    struct Repeater {
        bool enabled; // do repeats
        uint256[] contributions;
        mapping(address => uint256[]) contributorIndices;
    }

    mapping(address => Repeater) public repeaters; // Solver => Repeater

    event Repeated(
        address indexed solver,
        bytes32 indexed trackingId,
        uint256 conditionIndex
    );

    event FundedRepeater(
        address indexed solver,
        bytes32 indexed trackingId,
        uint256 amount,
        address from
    );

    event DefundedRepeater(
        address indexed solver,
        bytes32 indexed trackingId,
        uint256 amount,
        address to
    );

    constructor(IProposalsHub proposalsHub_) {
        proposalsHub = proposalsHub_;
        permits.push(ISolver.prepareSolve.selector);
    }

    function load(bytes memory data) external override {
        data;
        Repeater storage repeater = repeaters[msg.sender];
        repeater.enabled = true;
        emit LoadedModule(address(this), msg.sender);
    }

    function fund(ISolver solver, uint256 amount) external {
        Repeater storage repeater = repeaters[address(solver)];
        require(repeater.enabled, "Disabled");
        require(amount > 0, "Amount must be > 0");

        bytes32 trackingId = solver.trackingId();

        ProposalsHub.Proposal memory proposal = proposalsHub.getProposal(
            trackingId
        );

        IERC20 token = proposal.collateralToken;

        uint256 beforeBalance = token.balanceOf(address(this));

        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Could not transfer from msg.sender"
        );

        require(
            token.balanceOf(address(this)) - beforeBalance == amount,
            "Incorrect balance after transfer"
        );

        repeater.contributions.push(amount);

        repeater.contributorIndices[msg.sender].push(
            repeater.contributions.length - 1
        );

        emit FundedRepeater(address(solver), trackingId, amount, msg.sender);
    }

    function defund(ISolver solver, uint256 amount) external {
        Repeater storage repeater = repeaters[address(solver)];

        uint256[] memory contributionIndices = repeater.contributorIndices[
            msg.sender
        ];

        uint256 sum = 0;

        for (uint256 i = 0; i < contributionIndices.length; i++) {
            if (sum < amount) {
                uint256 contribution = repeater.contributions[
                    contributionIndices[i]
                ];

                if (contribution > 0) {
                    if (sum + contribution <= amount) {
                        sum += contribution;
                        delete repeater.contributions[contributionIndices[i]];
                    } else {
                        repeater.contributions[contributionIndices[i]] -=
                            amount -
                            sum;
                        sum += amount - sum;
                    }
                }
            }
        }

        require(sum == amount, "Not enough funds");

        bytes32 trackingId = solver.trackingId();

        ProposalsHub.Proposal memory proposal = proposalsHub.getProposal(
            trackingId
        );

        uint256 beforeBalance = proposal.collateralToken.balanceOf(
            address(this)
        );

        require(
            proposal.collateralToken.transfer(msg.sender, amount),
            "Transfer failed"
        );

        require(
            beforeBalance - proposal.collateralToken.balanceOf(address(this)) ==
                amount,
            "Before and after balance wrong"
        );

        emit DefundedRepeater(address(solver), trackingId, amount, msg.sender);
    }

    function repeat(ISolver solver) external {
        require(msg.sender == solver.keeper(), "Only Keeper");
        Repeater storage repeater = repeaters[address(solver)];
        require(repeater.enabled, "Disabled");

        bytes32 trackingId = solver.trackingId();

        ProposalsHub.Proposal memory proposal = proposalsHub.getProposal(
            trackingId
        );

        require(proposal.isExecuted, "Initial proposal not executed");

        SolverLib.Condition[] memory conditions = solver.getConditions();

        SolverLib.Condition memory condition = conditions[
            conditions.length - 1
        ];

        require(
            condition.status == SolverLib.Status.ArbitrationDelivered ||
                condition.status == SolverLib.Status.OutcomeReported,
            "Not ready to repeat"
        );

        uint256 sum = 0;

        for (uint256 i = 0; i < repeater.contributions.length; i++) {
            if (sum < proposal.fundingGoal) {
                uint256 contribution = repeater.contributions[i];

                if (contribution > 0) {
                    if (sum + contribution <= proposal.fundingGoal) {
                        sum += contribution;
                        delete repeater.contributions[i];
                    } else {
                        repeater.contributions[i] -= proposal.fundingGoal - sum;
                        sum += proposal.fundingGoal - sum;
                    }
                }
            }
        }

        require(sum == proposal.fundingGoal, "Not enough funds");

        require(
            proposal.collateralToken.transfer(
                address(solver),
                proposal.fundingGoal
            ),
            "Token transfer failed"
        );

        solver.prepareSolve(conditions.length);

        try solver.executeSolve(conditions.length) {} catch {}

        emit Repeated(address(solver), trackingId, conditions.length);
    }

    function disable(ISolver solver) external {
        require(msg.sender == solver.keeper(), "Only Keeper");
        repeaters[address(solver)].enabled = false;
    }

    function enable(ISolver solver) external {
        require(msg.sender == solver.keeper(), "Only Keeper");
        repeaters[address(solver)].enabled = true;
    }

    function getFunding(address solver) external view returns (uint256 sum) {
        for (uint256 i = 0; i < repeaters[solver].contributions.length; i++) {
            sum += repeaters[solver].contributions[i];
        }
    }

    function getFundingFrom(address solver, address account)
        external
        view
        returns (uint256 sum)
    {
        for (
            uint256 i = 0;
            i < repeaters[solver].contributorIndices[account].length;
            i++
        ) {
            sum += repeaters[solver].contributions[
                repeaters[solver].contributorIndices[account][i]
            ];
        }
    }
}
