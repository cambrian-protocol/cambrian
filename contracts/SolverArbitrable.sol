/**
 * SPDX-License-Identifier: MIT
 */

import "./interfaces/IArbitrator.sol";
import "./interfaces/IArbitrable.sol";
import "./Solver.sol";

pragma solidity 0.8.0;

contract SolverArbitrable is IArbitrable {
    enum Status {
        Initial,
        Requested,
        Disputed,
        Solved,
        Nulled
    }

    struct Dispute {
        IArbitrator arbitrator;
        Solver solver;
        address[] disputers;
        uint256[] disputerPaid;
        uint256[] disputedPayout;
        uint256[][] alternativePayouts;
        bytes extraData;
        Status status;
    }

    struct Payout {
        bytes32 id;
        uint256 index;
        address[] suggesters;
        uint256[] payout;
    }

    uint256 constant numberOfRulingOptions = 4;
    enum Choices {
        KeeperWin,
        KeeperWinPrejudice,
        DisputerWin,
        DisputerWinPrejudice
    }

    mapping(uint256 => Dispute) disputes;

    function requestArbitration(
        address _solverAddress,
        uint256[] memory _disputePayouts,
        bytes memory _extraData
    ) external payable {
        Solver _solver = Solver(_solverAddress);
        uint256 _conditionNum = _solver.numConditions();
        uint256 _disputeID = uint256(
            keccak256(abi.encodePacked(_solver, _conditionNum))
        );

        require(
            disputes[_disputeID].status == Status.Initial,
            "SolverArbitrable::Dispute not Status.Initial"
        );

        IArbitrator _arbitrator = IArbitrator(_solver.arbitrator());
        require(address(_arbitrator) != address(0), "Solver::No arbitrator");
        require(
            msg.value >= _arbitrator.arbitrationCost(""),
            "Solver::msg.value lower than arbitration fee"
        );

        // disputes[_disputeID].status = Status.Requested;
        // disputes[_disputeID].solver = _solver;
        // disputes[_disputeID].disputer = msg.sender;
        // disputes[_disputeID].disputerPaid = msg.value;
        // disputes[_disputeID].disputePayouts = _disputePayouts;
        // disputes[_disputeID].keeper = _solver.keeper();
        // disputes[_disputeID].extraData = _extraData;
    }

    function addAlternativePayout(
        uint256 _disputeID,
        uint256[] calldata _payout
    ) external payable {
        disputes[_disputeID].alternativePayouts.push(_payout);
    }

    function disputeArbitration(uint256 _disputeID) external payable {
        require(
            disputes[_disputeID].status == Status.Requested,
            "SolverArbitrable::Dispute not Status.Requested"
        );
        uint256 _fee = disputes[_disputeID].arbitrator.arbitrationCost("");
        require(
            msg.value >= _fee,
            "Solver::msg.value lower than arbitration fee"
        );
        require(
            msg.sender == disputes[_disputeID].keeper,
            "SolverArbitrable::Only Keeper"
        );

        disputes[_disputeID].status = Status.Disputed;
        disputes[_disputeID].keeperPaid = msg.value;
        disputes[_disputeID].arbitrator.createDispute{value: _fee}(
            numberOfRulingOptions,
            disputes[_disputeID].extraData
        );
    }

    function rule(uint256 _disputeID, uint256 _ruling) external override {
        require(
            msg.sender == address(disputes[_disputeID].arbitrator),
            "SolverArbitrable::Only arbitrator"
        );
        require(
            disputes[_disputeID].status == Status.Disputed,
            "SolverArbitrable::Dispute not Status.Disputed"
        );
        require(
            _ruling <= numberOfRulingOptions,
            "SolverArbitrable::Invalid ruling"
        );

        disputes[_disputeID].status = Status.Solved;

        if (_ruling == 0) {
            disputes[_disputeID].solver.arbitrateNull();
        } else if (_ruling == uint256(Choices.KeeperWin)) {
            disputes[_disputeID].solver.arbitrateKeeperWin({prejudice: false});
        } else if (_ruling == uint256(Choices.KeeperWinPrejudice)) {
            disputes[_disputeID].solver.arbitrateKeeperWin({prejudice: true});
        } else if (_ruling == uint256(Choices.DisputerWin)) {
            disputes[_disputeID].solver.arbitrateDisputerWin({
                prejudice: false
            });
        } else if (_ruling == uint256(Choices.DisputerWinPrejudice)) {
            disputes[_disputeID].solver.arbitrateDisputerWin({prejudice: true});
        }
    }
}
