// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ISolver.sol";
import "./interfaces/IConditionalTokens.sol";
import "./SolverFactory.sol";

library SolverLib {
    // Expected sources of data being ingested into the Solver
    struct Ingest {
        uint256 executions; // Number of times this Ingest has been executed
        IngestType ingestType;
        uint256 key; // Destination key for data
        uint256 solverIndex; // Index of the Solver in the chain to make function call to or register callback
        bytes data; // Raw when isConstant=true, slot index of upstream solver data when callback, else an encoded function call
    }

    // Ingest Types
    enum IngestType {
        Callback,
        Constant,
        Function
    }

    // Status state for Conditions
    enum Status {
        Initiated, // Default state
        Executed, // Solver has executed according to configuration
        OutcomeProposed, // Outcome has been proposed for reporting
        ArbitrationRequested, // One party has requested arbitration on this condition
        ArbitrationPending, // An official dispute has been raised and requires arbitration
        ArbitrationDelivered, // Arbitration (except 'null' arbitration) has been delivered for this condition
        OutcomeReported // Outcome has been reported to the CTF via reportPayouts()
    }

    // Condition object created by addCondition() from ConditionBase
    struct Condition {
        IERC20 collateralToken;
        bytes32 questionId; // // keccak256(abi.encodePacked(config.conditionBase.metadata, address(this), conditions.length))
        bytes32 parentCollectionId; // ID of the parent collection above this Solver in the CTF
        bytes32 conditionId; // ID of this condition in the CTF
        uint256[] payouts; // Currently proposed payouts. Final if reported == true
        Status status; // Status of this condition
    }

    // Immutable data regarding conditions which may be created
    struct ConditionBase {
        IERC20 collateralToken;
        uint256 outcomeSlots; // Num outcome slots
        uint256 parentCollectionIndexSet; // IndexSet to get parentCollectionId from parent Solver
        uint256 amountSlot; // Slot for amount of collateral being used        // TODO maybe make this dynamic also
        uint256[] partition; // Partition of positions for payouts
        uint256[] recipientAddressSlots; // Arrays of [i] for addressSlots[i] containing CT recipients
        uint256[][] recipientAmountSlots; // Arrays containing amount of CTs to send to each recipient for each partition
        string conditionURI; // Resource containing human-friendly descriptions of the conditions for this Solver
    }

    // Configuration of this Solver
    struct Config {
        Solver implementation; // The implementation address for this Solver
        address keeper; // Keeper address
        address arbitrator; // Arbitrator address
        uint256 timelockSeconds; // Number of seconds to increment timelock for during critical activities
        bytes data; // Arbitrary data
        Ingest[] ingests; // Data ingests to be performed to bring data in from other Solver
        ConditionBase conditionBase; // Base to create conditions from
    }

    struct Datas {
        mapping(uint256 => bytes) slots;
        mapping(uint256 => uint256) slotVersions;
    }

    function createCondition(
        ConditionBase calldata base,
        address chainParent,
        address oracle,
        uint256 conditionVer
    ) public returns (Condition memory condition) {
        condition.questionId = keccak256(
            abi.encodePacked(base.conditionURI, oracle, conditionVer)
        );

        if (chainParent == address(0)) {
            condition.parentCollectionId = bytes32(""); // top level collection
        } else {
            condition.parentCollectionId = getCollectionId(
                Solver(chainParent).getConditions()[conditionVer],
                base.parentCollectionIndexSet
            );
        }

        condition.conditionId = IConditionalTokens(
            0x5FbDB2315678afecb367f032d93F642f64180aa3
        ).getConditionId(
                oracle, // Solver is Oracle
                condition.questionId,
                base.outcomeSlots
            );

        condition.collateralToken = base.collateralToken;

        IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
            .prepareCondition(oracle, condition.questionId, base.outcomeSlots);
    }

    function ingestsValid(Ingest[] calldata ingests, uint256 conditionVer)
        public
        pure
        returns (bool)
    {
        for (uint256 i; i < ingests.length; i++) {
            if (ingests[i].executions != conditionVer) {
                return false;
            }
        }

        return true;
    }

    function deployChild(
        Config calldata config,
        address solver,
        uint256 solverIndex
    ) public returns (address child, Solver) {
        child = SolverFactory(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
            .createSolver(solver, solverIndex + 1, config);

        return (child, Solver(child));
    }

    function getPositionId(
        Condition memory condition,
        IERC20 collateralToken,
        uint256 partition
    ) public view returns (uint256 positionId) {
        IConditionalTokens ct = IConditionalTokens(
            0x5FbDB2315678afecb367f032d93F642f64180aa3
        );
        positionId = ct.getPositionId(
            collateralToken,
            ct.getCollectionId(
                condition.parentCollectionId,
                condition.conditionId,
                partition
            )
        );
    }

    function splitPosition(
        address chainParent,
        ConditionBase calldata base,
        Condition calldata condition,
        uint256 amount
    ) public {
        // uint256 _amount;

        if (chainParent == address(0)) {
            // _amount = IERC20(base.collateralToken).balanceOf(address(this));
            // require(_amount > 0, "No collateral.");

            base.collateralToken.approve(
                address(0x5FbDB2315678afecb367f032d93F642f64180aa3),
                amount
            );
        }

        IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
            .splitPosition(
                base.collateralToken,
                condition.parentCollectionId,
                condition.conditionId,
                base.partition,
                amount
            );
    }

    function reportPayouts(Condition storage condition) public {
        IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
            .reportPayouts(condition.questionId, condition.payouts);
    }

    function proposePayouts(
        Condition storage condition,
        uint256[] calldata _payouts
    ) public {
        condition.status = Status.OutcomeProposed;
        condition.payouts = _payouts;
    }

    function confirmPayouts(Condition storage condition) public {
        condition.status = Status.OutcomeReported;
        reportPayouts(condition);
    }

    function reportPayouts(
        Condition storage condition,
        uint256[] memory payouts
    ) public {
        IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
            .reportPayouts(condition.questionId, payouts);
    }

    function arbitrationPending(Condition storage condition) public {
        condition.status = Status.ArbitrationPending;
    }

    function arbitrationRequested(Condition storage condition) public {
        condition.status = Status.ArbitrationRequested;
    }

    function arbitrateNull(Condition storage condition) public {
        condition.status = Status.OutcomeProposed;
    }

    function arbitrate(Condition storage condition, uint256[] memory payouts)
        public
    {
        condition.status = Status.ArbitrationDelivered;
        reportPayouts(condition, payouts);
    }

    function addressFromChainIndex(
        uint256 index,
        address _this,
        address chainParent,
        address chainChild,
        uint256 chainIndex
    ) public view returns (address _address) {
        if (index == chainIndex) {
            return _this;
        } else if (index < chainIndex) {
            return ISolver(chainParent).addressFromChainIndex(index);
        } else if (index > chainIndex) {
            return ISolver(chainChild).addressFromChainIndex(index);
        }
    }

    function allocatePartition(
        Condition calldata condition,
        ConditionBase calldata base,
        address solver,
        Datas storage data,
        bytes32 trackingId
    ) public {
        uint256[] memory _tokens = new uint256[](base.partition.length);
        uint256[][] memory _amounts = new uint256[][](
            base.recipientAddressSlots.length
        );

        for (uint256 i; i < base.partition.length; i++) {
            _tokens[i] = getPositionId(
                condition,
                base.collateralToken,
                base.partition[i]
            );
        }

        for (uint256 i; i < base.recipientAddressSlots.length; i++) {
            _amounts[i] = new uint256[](base.partition.length);

            for (uint256 j; j < base.partition.length; j++) {
                _amounts[i][j] = abi.decode(
                    data.slots[base.recipientAmountSlots[j][i]],
                    (uint256)
                );
            }
        }

        for (uint256 i; i < base.recipientAddressSlots.length; i++) {
            IConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3)
                .safeBatchTransferFrom(
                    solver,
                    abi.decode(
                        data.slots[base.recipientAddressSlots[i]],
                        (address)
                    ),
                    _tokens,
                    _amounts[i],
                    abi.encode(trackingId)
                );
        }
    }

    function ingest(Ingest storage _ingest, address solver)
        public
        returns (bytes memory data)
    {
        _ingest.executions++;

        if (_ingest.ingestType != IngestType.Constant) {
            address _solver = Solver(solver).addressFromChainIndex(
                _ingest.solverIndex
            );
            (bool success, bytes memory retData) = _solver.staticcall(
                _ingest.data
            );
            require(success, "Ingest staticcall failed");
            data = retData;
        } else {
            data = _ingest.data;
        }
    }

    function getCollectionId(Condition memory condition, uint256 partition)
        public
        view
        returns (bytes32 collectionId)
    {
        collectionId = IConditionalTokens(
            0x5FbDB2315678afecb367f032d93F642f64180aa3
        ).getCollectionId(
                condition.parentCollectionId,
                condition.conditionId,
                partition
            );
    }

    function mulScale(
        uint256 x,
        uint256 y,
        uint128 scale
    ) internal pure returns (uint256) {
        uint256 a = x / scale;
        uint256 b = x % scale;
        uint256 c = y / scale;
        uint256 d = y % scale;

        return a * c * scale + a * d + b * c + (b * d) / scale;
    }
}
