pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Solver.sol";
import "./interfaces/ISolver.sol";
import "./interfaces/IConditionalTokens.sol";
import "./interfaces/ISolverFactory.sol";
import "./FullMath.sol";
import "hardhat/console.sol";

library SolverLib {
    // Ingest Types
    enum IngestType {
        Callback,
        Constant,
        Function,
        Manual
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

    struct Multihash {
        bytes32 digest;
        uint8 hashFunction;
        uint8 size;
    }

    // Expected sources of data being ingested into the Solver
    struct Ingest {
        uint256 executions; // Number of times this Ingest has been executed
        IngestType ingestType;
        uint256 slot; // Destination slot for data
        uint256 solverIndex; // Index of the Solver in the chain to make function call to or register callback
        bytes data; // Raw when isConstant=true, slot index of upstream solver data when callback, else an encoded function call
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
        Multihash[] outcomeURIs; // Resource containing human-friendly descriptions of the conditions for this Solver
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

    struct Callbacks {
        uint256 numIncoming;
        uint256 numOutgoing;
        mapping(uint256 => address[]) outgoing; // This Slot => Solver expecting callback
        mapping(bytes32 => uint256) incoming; // keccack256(Address, CallerSlot) => ingest index
    }

    function createCondition(
        address ctfAddress,
        ConditionBase calldata base,
        address chainParent,
        uint256 conditionIdx
    ) public returns (Condition memory condition) {
        condition.questionId = keccak256(
            abi.encode(base.outcomeURIs, address(this), conditionIdx)
        );

        if (chainParent == address(0)) {
            condition.parentCollectionId = bytes32(""); // top level collection
        } else {
            Condition[] memory _chainParentConditions = ISolver(chainParent)
                .getConditions();

            require(
                _chainParentConditions.length > 0,
                "Parent has no conditions"
            );

            condition.parentCollectionId = getCollectionId(
                ctfAddress,
                _chainParentConditions[_chainParentConditions.length - 1],
                base.parentCollectionIndexSet
            );
        }

        condition.conditionId = IConditionalTokens(ctfAddress).getConditionId(
            address(this), // Solver is Oracle
            condition.questionId,
            base.outcomeSlots
        );

        condition.collateralToken = base.collateralToken;

        IConditionalTokens(ctfAddress).prepareCondition(
            address(this),
            condition.questionId,
            base.outcomeSlots
        );
    }

    function deployChild(
        address factoryAddress,
        Config calldata config,
        address solver,
        uint256 solverIndex
    ) public returns (address child, Solver) {
        child = ISolverFactory(factoryAddress).createSolver(
            solver,
            solverIndex + 1,
            config
        );

        return (child, Solver(child));
    }

    function getPositionId(
        address ctfAddress,
        Condition memory condition,
        IERC20 collateralToken,
        uint256 partition
    ) public view returns (uint256 positionId) {
        IConditionalTokens ct = IConditionalTokens(ctfAddress);
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
        address ctfAddress,
        address chainParent,
        ConditionBase calldata base,
        Condition calldata condition,
        uint256 amount
    ) public {
        uint256 _balance;

        IConditionalTokens ICT = IConditionalTokens(ctfAddress);

        if (chainParent == address(0)) {
            _balance = IERC20(base.collateralToken).balanceOf(address(this));
            base.collateralToken.approve(ctfAddress, bpToNum(amount, _balance));
        } else {
            _balance = ICT.balanceOf(
                address(this),
                ICT.getPositionId(
                    base.collateralToken,
                    condition.parentCollectionId
                )
            );
        }

        ICT.splitPosition(
            base.collateralToken,
            condition.parentCollectionId,
            condition.conditionId,
            base.partition,
            bpToNum(amount, _balance)
        );
    }

    function reportPayouts(address ctfAddress, Condition storage condition)
        public
    {
        IConditionalTokens(ctfAddress).reportPayouts(
            condition.questionId,
            condition.payouts
        );
    }

    function reportPayouts(
        address ctfAddress,
        Condition storage condition,
        uint256[] memory payouts
    ) public {
        IConditionalTokens(ctfAddress).reportPayouts(
            condition.questionId,
            payouts
        );
    }

    function proposePayouts(
        Condition storage condition,
        uint256[] calldata _payouts
    ) public {
        condition.status = Status.OutcomeProposed;
        condition.payouts = _payouts;
    }

    function confirmPayouts(address ctfAddress, Condition storage condition)
        public
    {
        condition.status = Status.OutcomeReported;
        reportPayouts(ctfAddress, condition);
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

    function arbitrate(
        address ctfAddress,
        Condition storage condition,
        uint256[] memory payouts
    ) public {
        condition.status = Status.ArbitrationDelivered;
        reportPayouts(ctfAddress, condition, payouts);
    }

    function allocatePartition(
        address ctfAddress,
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
                ctfAddress,
                condition,
                base.collateralToken,
                base.partition[i]
            );
        }

        address[] memory _addressThis = new address[](_tokens.length);
        for (uint256 i; i < _tokens.length; i++) {
            _addressThis[i] = address(this);
        }

        uint256[] memory _balances = IConditionalTokens(ctfAddress)
            .balanceOfBatch(_addressThis, _tokens);

        for (uint256 i; i < base.recipientAddressSlots.length; i++) {
            _amounts[i] = new uint256[](base.partition.length);

            for (uint256 j; j < base.partition.length; j++) {
                uint256 _pctValue = abi.decode(
                    data.slots[base.recipientAmountSlots[j][i]],
                    (uint256)
                );

                if (_pctValue != 0) {
                    _amounts[i][j] = bpToNum(_pctValue, _balances[j]);
                } else {
                    _amounts[i][j] = 0;
                }
            }
        }

        for (uint256 i; i < base.recipientAddressSlots.length; i++) {
            IConditionalTokens(ctfAddress).safeBatchTransferFrom(
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

    function bpToNum(uint256 bp, uint256 num) public pure returns (uint256) {
        return FullMath.mulDiv(bp, num, 10000);
    }

    function ingest(Ingest storage _ingest)
        public
        view
        returns (bytes memory data)
    {
        require(
            _ingest.ingestType != IngestType.Manual,
            "Manual ingests should not get here"
        );

        if (_ingest.ingestType == IngestType.Constant) {
            data = _ingest.data;
        } else {
            address _solver = ISolver(address(this)).addressFromChainIndex(
                _ingest.solverIndex
            );
            (bool success, bytes memory retData) = _solver.staticcall(
                _ingest.data
            );
            require(success, "Ingest staticcall failed");
            data = retData;
        }
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

    function getCollectionId(
        address ctfAddress,
        Condition memory condition,
        uint256 partition
    ) public view returns (bytes32 collectionId) {
        collectionId = IConditionalTokens(ctfAddress).getCollectionId(
            condition.parentCollectionId,
            condition.conditionId,
            partition
        );
    }
}
