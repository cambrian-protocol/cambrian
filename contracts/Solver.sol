// SPDX-License-Identifier: GPL-3.0-or-Collateral
/* solhint-disable space-after-comma */
pragma solidity 0.8.0;

import "./ConditionalTokens.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./SolutionsHub.sol";
import "hardhat/console.sol";

// CT_DEV Address = 0x5FbDB2315678afecb367f032d93F642f64180aa3

contract Solver is Initializable, ERC1155Receiver {
    ConditionalTokens public immutable conditionalTokens =
        ConditionalTokens(0x5FbDB2315678afecb367f032d93F642f64180aa3); // ConditionalTokens contract dev address

    struct Action {
        bool executed;
        bool isPort;
        address to;
        uint256 portIndex;
        uint256 value;
        bytes data;
    }

    /**
        @dev                    Expected sources of data being ingested into the Solver
        executions              Number of times this Ingest has been executed
        isDeferred              Data is waiting on an upstream action and must be ingested manually later
        isConstant              Data is supplied directly which cannot change
        port                    Destination port for data: addressPort || boolPort || bytesPort || bytes32Port || uint256Port
        key                     Destination key for data
        solverIndex             Index of the Solver in the chain to make this call to
        data                    Raw when isConstant=true, else an encoded function call
     */
    struct Ingest {
        uint256 executions;
        bool isDeferred;
        bool isConstant;
        uint8 port;
        uint256 key;
        uint256 solverIndex;
        bytes data;
    }

    /**
        @dev                    Status state for Conditions
        Initiated               Default state
        Executed                Solver has executed according to configuration
        OutcomeProposed         Outcome has been proposed for reporting.
        ArbitrationRequested    One party has requested arbitration on this condition
        ArbitrationPending      An official dispute has been raised and requires arbitration
        ArbitrationDelivered    Arbitration (except 'null' arbitration) has been delivered for this condition
        OutcomeReported         Outcome has been reported to the CTF via reportPayouts()
     */
    enum Status {
        Initiated,
        Executed,
        OutcomeProposed,
        ArbitrationRequested,
        ArbitrationPending,
        ArbitrationDelivered,
        OutcomeReported
    }

    /**
        @dev                    Condition object created by addCondition() from ConditionBase
        questionId              keccak256(abi.encodePacked(config.conditionBase.metadata, address(this), conditions.length))
        parentCollectionId      ID of the parent collection above this Solver in the CTF
        conditionId             ID of this condition in the CTF
        payouts                 Currently proposed payouts. Final if reported == true
        status                  Status of this condition
     */
    struct Condition {
        bytes32 questionId;
        bytes32 parentCollectionId;
        bytes32 conditionId;
        uint256[] payouts;
        Status status;
    }

    /**
        @dev                    Used to generate conditions when addCondition() is called
        outcomeSlots            Num outcome slots
        ParentColl...           Index of partition to get parentCollectionId from parent Solver's uint256[] partition
        amount                  Amount of collateral being used        // TODO maybe make this dynamic also
        partition               Partition of positions for payouts
        recipientAddressPorts   Arrays of [i] for addressPorts[i] containing CT recipients
        recipientAmounts        Arrays containing amount of CTs to send to each recipient for each partition
        metadata                Descriptive string describing the condition
     */
    struct ConditionBase {
        uint256 outcomeSlots;
        uint256 parentCollectionPartitionIndex;
        uint256 amount;
        uint256[] partition;
        uint256[][] recipientAddressPorts;
        uint256[][] recipientAmounts;
        string metadata;
    }

    /**
        @dev                    Configuration of this Solver
        implementation          The implementation address for this Solver
        keeper                  Keeper address
        arbitrator              Arbitrator address
        timelockSeconds         Number of seconds to increment timelock for during critical activities
        data                    Arbitrary data
        ingests;                Data ingests to be performed to bring data in from other Solver
        actions                 Arbitrary actions to be run during execution
        conditionBase           Base to create conditions from
     */
    struct Config {
        Solver implementation;
        address keeper;
        address arbitrator;
        uint256 timelockSeconds;
        bytes data;
        Ingest[] ingests;
        Action[] actions;
        ConditionBase conditionBase;
    }

    Config public config; // Primary config of the Solver
    Condition[] public conditions; // Array of conditions

    IERC20 public collateralToken; // Collateral being used

    address public chainParent;
    address public chainChild;
    uint256 public chainIndex;
    uint256 public timelock; // Current timelock
    bytes32 public trackingId;

    mapping(uint256 => address) public addressPort;
    mapping(uint256 => bool) public boolPort;
    mapping(uint256 => bytes) public bytesPort;
    mapping(uint256 => bytes32) public bytes32Port;
    mapping(uint256 => uint256) public uint256Port;
    mapping(uint256 => mapping(uint256 => bool)) public lockedPorts; // locks constant ports
    mapping(uint256 => mapping(uint256 => uint256)) public portVersions; // version tracking for unlocked ports

    function init(
        IERC20 _collateralToken,
        address _chainParent,
        uint256 _chainIndex,
        Config calldata _solverConfig
    ) external {
        require(
            msg.sender == address(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512), // FACTORY DEV ADDRESS
            "Solver::Only factory may call init"
        );
        require(
            _solverConfig.keeper != address(0),
            "Solver: Keeper address invalid"
        );
        collateralToken = _collateralToken;
        chainParent = _chainParent;
        chainIndex = _chainIndex;
        config = _solverConfig;
    }

    function deployChild(Config calldata _config)
        external
        returns (Solver _solver)
    {
        require(chainChild == address(0), "Solver::Solver already has child");

        chainChild = SolverFactory(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
            .createSolver(
                collateralToken,
                address(this),
                chainIndex + 1,
                _config
            );

        _solver = Solver(chainChild);
    }

    function router(
        uint8 _port,
        uint256 _key,
        bytes memory _data
    ) private {
        if (_port == 0) {
            addressPort[_key] = abi.decode(_data, (address));
        } else if (_port == 1) {
            boolPort[_key] = abi.decode(_data, (bool));
        } else if (_port == 2) {
            bytesPort[_key] = abi.decode(_data, (bytes));
        } else if (_port == 3) {
            bytes32Port[_key] = abi.decode(_data, (bytes32));
        } else if (_port == 4) {
            uint256Port[_key] = abi.decode(_data, (uint256));
        }
    }

    function constantRouter(
        uint8 _port,
        uint256 _key,
        bytes memory _data
    ) internal {
        require(!lockedPorts[_port][_key], "Solver::Constant port locked");
        lockedPorts[_port][_key] = true;
        router(_port, _key, _data);
    }

    function dynamicRouter(
        uint8 _port,
        uint256 _key,
        bytes memory _data
    ) internal {
        require(!lockedPorts[_port][_key], "Solver::Dynamic port locked");
        require(
            portVersions[_port][_key] == (conditions.length - 1),
            "Solver::Port version does not match condition version"
        );
        portVersions[_port][_key]++;
        router(_port, _key, _data);
    }

    function addData(
        uint8 _port,
        uint256 _key,
        bytes memory _data
    ) external {
        dynamicRouter(_port, _key, _data);
    }

    function executeIngests() private {
        for (uint256 i; i < config.ingests.length; i++) {
            if (!config.ingests[i].isDeferred) {
                ingest(i);
            }
        }
    }

    function ingest(uint256 _index) public {
        config.ingests[_index].executions++;

        if (config.ingests[_index].isConstant) {
            constantRouter(
                config.ingests[_index].port,
                config.ingests[_index].key,
                config.ingests[_index].data
            );
        } else {
            bytes memory _retData = staticcallSolver(
                config.ingests[_index].solverIndex,
                config.ingests[_index].data
            );
            dynamicRouter(
                config.ingests[_index].port,
                config.ingests[_index].key,
                _retData
            );
        }
    }

    function getOutput(uint256 _port, uint256 _key)
        external
        view
        returns (bytes memory data)
    {
        require(
            lockedPorts[_port][_key] ||
                portVersions[_port][_key] == conditions.length,
            "Solver::Port is unmapped or wrong version."
        );
        if (_port == 0) {
            return abi.encode(addressPort[_key]);
        } else if (_port == 1) {
            return abi.encode(boolPort[_key]);
        } else if (_port == 2) {
            return abi.encode(bytesPort[_key]);
        } else if (_port == 3) {
            return abi.encode(bytes32Port[_key]);
        } else if (_port == 3) {
            return abi.encode(uint256Port[_key]);
        }
    }

    function deferredIngestsValid() public view returns (bool) {
        bool _bool = true;

        for (uint256 i; i < config.ingests.length; i++) {
            if (
                config.ingests[i].isDeferred &&
                (config.ingests[i].executions != conditions.length)
            ) {
                _bool = false;
            }
        }

        return _bool;
    }

    function addCondition() private {
        Condition memory _condition;

        _condition.questionId = keccak256(
            abi.encodePacked(
                config.conditionBase.metadata,
                address(this),
                conditions.length
            )
        );

        if (chainParent == address(0)) {
            _condition.parentCollectionId = bytes32(""); // top level collection
        } else {
            _condition.parentCollectionId = Solver(chainParent)
                .getCanonCollectionId(
                    config.conditionBase.parentCollectionPartitionIndex
                );
        }

        _condition.conditionId = conditionalTokens.getConditionId(
            address(this), // Solver is Oracle
            _condition.questionId,
            config.conditionBase.outcomeSlots
        );

        conditions.push(_condition);

        prepareCondition();
    }

    function prepareCondition() private {
        conditionalTokens.prepareCondition(
            address(this),
            conditions[conditions.length - 1].questionId,
            config.conditionBase.outcomeSlots
        );
    }

    function handleShallowPosition() private {
        if (chainParent == address(0)) {
            IERC20(collateralToken).approve(
                address(conditionalTokens),
                config.conditionBase.amount
            );
        }
    }

    function splitPosition() private {
        conditionalTokens.splitPosition(
            collateralToken,
            conditions[conditions.length - 1].parentCollectionId,
            conditions[conditions.length - 1].conditionId,
            config.conditionBase.partition,
            config.conditionBase.amount
        );
    }

    function allocatePartition() private {
        for (uint256 i; i < config.conditionBase.partition.length; i++) {
            bytes32 _collectionId = conditionalTokens.getCollectionId(
                conditions[conditions.length - 1].parentCollectionId,
                conditions[conditions.length - 1].conditionId,
                config.conditionBase.partition[i]
            );

            uint256 _positionId = conditionalTokens.getPositionId(
                collateralToken,
                _collectionId
            );

            for (
                uint256 j;
                j < config.conditionBase.recipientAddressPorts.length;
                j++
            ) {
                if (config.conditionBase.recipientAmounts[i][j] > 0) {
                    console.logAddress(
                        addressPort[
                            config.conditionBase.recipientAddressPorts[i][j]
                        ]
                    );
                    conditionalTokens.safeTransferFrom(
                        address(this),
                        addressPort[
                            config.conditionBase.recipientAddressPorts[i][j]
                        ],
                        _positionId,
                        config.conditionBase.recipientAmounts[i][j],
                        abi.encode(trackingId)
                    );
                }
            }
        }
    }

    function prepareSolve() public {
        addCondition();
        executeIngests();
    }

    function executeSolve() public {
        require(
            conditions[conditions.length - 1].status == Status.Initiated,
            "Solver::Condition not status Initiated"
        );
        require(deferredIngestsValid(), "Solver::Deferred ingests invalid");

        conditions[conditions.length - 1].status = Status.Executed;

        handleShallowPosition();
        splitPosition();
        allocatePartition();
        unsafeExecuteActions();
        cascade();
    }

    function cascade() private {
        if (
            chainChild != address(0) &&
            Solver(chainChild).deferredIngestsValid()
        ) {
            Solver(chainChild).executeSolve();
        }
    }

    function updateTimelock() internal {
        timelock = block.timestamp + (config.timelockSeconds * 1 seconds);
    }

    function proposePayouts(uint256[] calldata _payouts) external {
        require(msg.sender == config.keeper, "Solver::Only Keeper");
        require(
            conditions[conditions.length - 1].status == Status.Executed,
            "Solver::Condition state not Status.Executed"
        );

        conditions[conditions.length - 1].status = Status.OutcomeProposed;
        conditions[conditions.length - 1].payouts = _payouts;
        updateTimelock();
    }

    function confirmPayouts() external {
        require(msg.sender == config.keeper, "Solver::Only Keeper");
        require(block.timestamp > timelock, "Solver::Timelock still locked");
        require(
            conditions[conditions.length - 1].status == Status.OutcomeProposed,
            "Solver::Outcome must be proposed first"
        );

        conditionalTokens.reportPayouts(
            conditions[conditions.length - 1].questionId,
            conditions[conditions.length - 1].payouts
        );
        conditions[conditions.length - 1].status = Status.OutcomeReported;
    }

    function arbitrate(uint256[] memory payouts) external {
        require(msg.sender == config.arbitrator, "Solver::Only arbitrator");
        require(
            conditions[conditions.length - 1].status ==
                Status.ArbitrationPending,
            "Solver::Not Status.ArbitrationPending"
        );
        require(block.timestamp > timelock, "Solver::Timelock still locked");

        conditions[conditions.length - 1].status = Status.ArbitrationDelivered;
        conditionalTokens.reportPayouts(
            conditions[conditions.length - 1].questionId,
            payouts
        );
    }

    function arbitrateNull() external {
        require(msg.sender == config.arbitrator, "Solver::Only arbitrator");
        require(
            conditions[conditions.length - 1].status ==
                Status.ArbitrationPending,
            "Solver::Not Status.ArbitrationPending"
        );

        conditions[conditions.length - 1].status = Status.OutcomeProposed;
        updateTimelock();
    }

    function arbitrationRequested() external {
        require(msg.sender == config.arbitrator, "Solver::Only arbitrator");
        require(
            conditions[conditions.length - 1].status == Status.OutcomeProposed,
            "Solver::Not Status.OutcomeProposed"
        );
        conditions[conditions.length - 1].status = Status.ArbitrationRequested;
        updateTimelock();
    }

    function arbitrationPending() external {
        require(msg.sender == config.arbitrator, "Solver::Only arbitrator");
        require(
            conditions[conditions.length - 1].status ==
                Status.ArbitrationRequested,
            "Solver::Not Status.ArbitrationRequested"
        );
        conditions[conditions.length - 1].status = Status.ArbitrationPending;
        updateTimelock();
    }

    function unsafeExecuteActions() private {
        for (uint256 i; i < config.actions.length; i++) {
            unsafeExecuteAction(i);
        }
    }

    function unsafeExecuteAction(uint256 _actionIndex) private {
        require(
            !config.actions[_actionIndex].executed,
            "Solver::action executed"
        );
        require(
            address(this).balance >= config.actions[_actionIndex].value,
            "Solver::insufficient eth"
        );

        // execute call
        config.actions[_actionIndex].executed = true;

        Action memory _action = config.actions[_actionIndex];

        if (_action.isPort) {
            _action.to = addressPort[_action.portIndex];
        }

        (bool success, bytes memory retData) = _action.to.call{
            value: _action.value
        }(_action.data);
        require(success, "Solver::call failure");
    }

    function getCanonCollectionId(uint256 _partitionIndex)
        external
        view
        returns (bytes32 _id)
    {
        bytes32 _collectionId = conditionalTokens.getCollectionId(
            conditions[conditions.length - 1].parentCollectionId,
            conditions[conditions.length - 1].conditionId,
            config.conditionBase.partition[_partitionIndex]
        );
        return _collectionId;
    }

    function addressFromChainIndex(uint256 _index)
        public
        view
        returns (address _address)
    {
        if (_index == chainIndex) {
            _address = address(this);
        } else if (_index < chainIndex) {
            _address = Solver(chainParent).addressFromChainIndex(_index);
        } else if (_index > chainIndex) {
            _address = Solver(chainChild).addressFromChainIndex(_index);
        }
    }

    function staticcallSolver(uint256 _solverIndex, bytes memory _data)
        public
        view
        returns (bytes memory)
    {
        address _solver = addressFromChainIndex(_solverIndex);
        (bool success, bytes memory retData) = _solver.staticcall(_data);
        require(success, "Solver::Ingest staticcall failed");
        return retData;
    }

    function getPayouts() public view returns (uint256[] memory) {
        return conditions[conditions.length - 1].payouts;
    }

    function numConditions() public view returns (uint256) {
        return conditions.length;
    }

    function arbitrator() public view returns (address) {
        return config.arbitrator;
    }

    function keeper() public view returns (address) {
        return config.keeper;
    }

    function setTrackingId(bytes32 _trackingId) public {
        require(trackingId == bytes32(0), "Solver::TrackingId already set");
        trackingId = _trackingId;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
