/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface ISolverInterface extends ethers.utils.Interface {
  functions: {
    "addressFromChainIndex(uint256)": FunctionFragment;
    "allocatePartition(uint256[],uint256[][],address[][])": FunctionFragment;
    "arbitrate(uint256,uint256[])": FunctionFragment;
    "confirmPayouts(uint256)": FunctionFragment;
    "createCondition(bytes32,uint256)": FunctionFragment;
    "deployChild(tuple)": FunctionFragment;
    "executeSolve(uint256)": FunctionFragment;
    "nullArbitrate(uint256)": FunctionFragment;
    "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)": FunctionFragment;
    "onERC1155Received(address,address,uint256,uint256,bytes)": FunctionFragment;
    "prepareSolve(uint256)": FunctionFragment;
    "proposePayouts(uint256,uint256[])": FunctionFragment;
    "setApproval(address,bool)": FunctionFragment;
    "setTrackingId(bytes32)": FunctionFragment;
    "splitCondition(bytes32,bytes32,uint256,uint256[],address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addressFromChainIndex",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "allocatePartition",
    values: [BigNumberish[], BigNumberish[][], string[][]]
  ): string;
  encodeFunctionData(
    functionFragment: "arbitrate",
    values: [BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "confirmPayouts",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createCondition",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "deployChild",
    values: [
      {
        implementation: string;
        keeper: string;
        arbitrator: string;
        timelockSeconds: BigNumberish;
        data: BytesLike;
        ingests: {
          executions: BigNumberish;
          isDeferred: boolean;
          isConstant: boolean;
          dataType: BigNumberish;
          key: BigNumberish;
          solverIndex: BigNumberish;
          data: BytesLike;
        }[];
        conditionBase: {
          collateralToken: string;
          outcomeSlots: BigNumberish;
          parentCollectionIndexSet: BigNumberish;
          amountSlot: BigNumberish;
          partition: BigNumberish[];
          recipientAddressSlots: BigNumberish[];
          recipientAmountSlots: BigNumberish[][];
          conditionURI: string;
        };
      }
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "executeSolve",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "nullArbitrate",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC1155BatchReceived",
    values: [string, string, BigNumberish[], BigNumberish[], BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC1155Received",
    values: [string, string, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "prepareSolve",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "proposePayouts",
    values: [BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "setApproval",
    values: [string, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setTrackingId",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "splitCondition",
    values: [
      BytesLike,
      BytesLike,
      BigNumberish,
      BigNumberish[],
      string,
      BigNumberish
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "addressFromChainIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "allocatePartition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "arbitrate", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "confirmPayouts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createCondition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "deployChild",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "executeSolve",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "nullArbitrate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC1155BatchReceived",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC1155Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "prepareSolve",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "proposePayouts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setApproval",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setTrackingId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "splitCondition",
    data: BytesLike
  ): Result;

  events: {};
}

export class ISolver extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: ISolverInterface;

  functions: {
    addressFromChainIndex(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string] & { _address: string }>;

    allocatePartition(
      _partition: BigNumberish[],
      _amounts: BigNumberish[][],
      _addresses: string[][],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    arbitrate(
      _index: BigNumberish,
      _payouts: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    confirmPayouts(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    createCondition(
      _questionId: BytesLike,
      _outcomeSlots: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    deployChild(
      _config: {
        implementation: string;
        keeper: string;
        arbitrator: string;
        timelockSeconds: BigNumberish;
        data: BytesLike;
        ingests: {
          executions: BigNumberish;
          isDeferred: boolean;
          isConstant: boolean;
          dataType: BigNumberish;
          key: BigNumberish;
          solverIndex: BigNumberish;
          data: BytesLike;
        }[];
        conditionBase: {
          collateralToken: string;
          outcomeSlots: BigNumberish;
          parentCollectionIndexSet: BigNumberish;
          amountSlot: BigNumberish;
          partition: BigNumberish[];
          recipientAddressSlots: BigNumberish[];
          recipientAmountSlots: BigNumberish[][];
          conditionURI: string;
        };
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    executeSolve(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    nullArbitrate(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    onERC1155BatchReceived(
      operator: string,
      from: string,
      ids: BigNumberish[],
      values: BigNumberish[],
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    onERC1155Received(
      operator: string,
      from: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    prepareSolve(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    proposePayouts(
      _index: BigNumberish,
      _payouts: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setApproval(
      operator: string,
      approved: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setTrackingId(
      _trackingId: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    splitCondition(
      _questionId: BytesLike,
      _parentCollectionId: BytesLike,
      _outcomeSlots: BigNumberish,
      _partition: BigNumberish[],
      _collateralToken: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  addressFromChainIndex(
    _index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  allocatePartition(
    _partition: BigNumberish[],
    _amounts: BigNumberish[][],
    _addresses: string[][],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  arbitrate(
    _index: BigNumberish,
    _payouts: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  confirmPayouts(
    _index: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  createCondition(
    _questionId: BytesLike,
    _outcomeSlots: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  deployChild(
    _config: {
      implementation: string;
      keeper: string;
      arbitrator: string;
      timelockSeconds: BigNumberish;
      data: BytesLike;
      ingests: {
        executions: BigNumberish;
        isDeferred: boolean;
        isConstant: boolean;
        dataType: BigNumberish;
        key: BigNumberish;
        solverIndex: BigNumberish;
        data: BytesLike;
      }[];
      conditionBase: {
        collateralToken: string;
        outcomeSlots: BigNumberish;
        parentCollectionIndexSet: BigNumberish;
        amountSlot: BigNumberish;
        partition: BigNumberish[];
        recipientAddressSlots: BigNumberish[];
        recipientAmountSlots: BigNumberish[][];
        conditionURI: string;
      };
    },
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  executeSolve(
    _index: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  nullArbitrate(
    _index: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  onERC1155BatchReceived(
    operator: string,
    from: string,
    ids: BigNumberish[],
    values: BigNumberish[],
    data: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  onERC1155Received(
    operator: string,
    from: string,
    id: BigNumberish,
    value: BigNumberish,
    data: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  prepareSolve(
    _index: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  proposePayouts(
    _index: BigNumberish,
    _payouts: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setApproval(
    operator: string,
    approved: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setTrackingId(
    _trackingId: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  splitCondition(
    _questionId: BytesLike,
    _parentCollectionId: BytesLike,
    _outcomeSlots: BigNumberish,
    _partition: BigNumberish[],
    _collateralToken: string,
    _amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addressFromChainIndex(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    allocatePartition(
      _partition: BigNumberish[],
      _amounts: BigNumberish[][],
      _addresses: string[][],
      overrides?: CallOverrides
    ): Promise<void>;

    arbitrate(
      _index: BigNumberish,
      _payouts: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    confirmPayouts(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    createCondition(
      _questionId: BytesLike,
      _outcomeSlots: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    deployChild(
      _config: {
        implementation: string;
        keeper: string;
        arbitrator: string;
        timelockSeconds: BigNumberish;
        data: BytesLike;
        ingests: {
          executions: BigNumberish;
          isDeferred: boolean;
          isConstant: boolean;
          dataType: BigNumberish;
          key: BigNumberish;
          solverIndex: BigNumberish;
          data: BytesLike;
        }[];
        conditionBase: {
          collateralToken: string;
          outcomeSlots: BigNumberish;
          parentCollectionIndexSet: BigNumberish;
          amountSlot: BigNumberish;
          partition: BigNumberish[];
          recipientAddressSlots: BigNumberish[];
          recipientAmountSlots: BigNumberish[][];
          conditionURI: string;
        };
      },
      overrides?: CallOverrides
    ): Promise<string>;

    executeSolve(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    nullArbitrate(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    onERC1155BatchReceived(
      operator: string,
      from: string,
      ids: BigNumberish[],
      values: BigNumberish[],
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    onERC1155Received(
      operator: string,
      from: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    prepareSolve(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    proposePayouts(
      _index: BigNumberish,
      _payouts: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    setApproval(
      operator: string,
      approved: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    setTrackingId(
      _trackingId: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    splitCondition(
      _questionId: BytesLike,
      _parentCollectionId: BytesLike,
      _outcomeSlots: BigNumberish,
      _partition: BigNumberish[],
      _collateralToken: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    addressFromChainIndex(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    allocatePartition(
      _partition: BigNumberish[],
      _amounts: BigNumberish[][],
      _addresses: string[][],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    arbitrate(
      _index: BigNumberish,
      _payouts: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    confirmPayouts(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    createCondition(
      _questionId: BytesLike,
      _outcomeSlots: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    deployChild(
      _config: {
        implementation: string;
        keeper: string;
        arbitrator: string;
        timelockSeconds: BigNumberish;
        data: BytesLike;
        ingests: {
          executions: BigNumberish;
          isDeferred: boolean;
          isConstant: boolean;
          dataType: BigNumberish;
          key: BigNumberish;
          solverIndex: BigNumberish;
          data: BytesLike;
        }[];
        conditionBase: {
          collateralToken: string;
          outcomeSlots: BigNumberish;
          parentCollectionIndexSet: BigNumberish;
          amountSlot: BigNumberish;
          partition: BigNumberish[];
          recipientAddressSlots: BigNumberish[];
          recipientAmountSlots: BigNumberish[][];
          conditionURI: string;
        };
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    executeSolve(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    nullArbitrate(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    onERC1155BatchReceived(
      operator: string,
      from: string,
      ids: BigNumberish[],
      values: BigNumberish[],
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    onERC1155Received(
      operator: string,
      from: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    prepareSolve(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    proposePayouts(
      _index: BigNumberish,
      _payouts: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setApproval(
      operator: string,
      approved: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setTrackingId(
      _trackingId: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    splitCondition(
      _questionId: BytesLike,
      _parentCollectionId: BytesLike,
      _outcomeSlots: BigNumberish,
      _partition: BigNumberish[],
      _collateralToken: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addressFromChainIndex(
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    allocatePartition(
      _partition: BigNumberish[],
      _amounts: BigNumberish[][],
      _addresses: string[][],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    arbitrate(
      _index: BigNumberish,
      _payouts: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    confirmPayouts(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    createCondition(
      _questionId: BytesLike,
      _outcomeSlots: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    deployChild(
      _config: {
        implementation: string;
        keeper: string;
        arbitrator: string;
        timelockSeconds: BigNumberish;
        data: BytesLike;
        ingests: {
          executions: BigNumberish;
          isDeferred: boolean;
          isConstant: boolean;
          dataType: BigNumberish;
          key: BigNumberish;
          solverIndex: BigNumberish;
          data: BytesLike;
        }[];
        conditionBase: {
          collateralToken: string;
          outcomeSlots: BigNumberish;
          parentCollectionIndexSet: BigNumberish;
          amountSlot: BigNumberish;
          partition: BigNumberish[];
          recipientAddressSlots: BigNumberish[];
          recipientAmountSlots: BigNumberish[][];
          conditionURI: string;
        };
      },
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    executeSolve(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    nullArbitrate(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    onERC1155BatchReceived(
      operator: string,
      from: string,
      ids: BigNumberish[],
      values: BigNumberish[],
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    onERC1155Received(
      operator: string,
      from: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    prepareSolve(
      _index: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    proposePayouts(
      _index: BigNumberish,
      _payouts: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setApproval(
      operator: string,
      approved: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setTrackingId(
      _trackingId: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    splitCondition(
      _questionId: BytesLike,
      _parentCollectionId: BytesLike,
      _outcomeSlots: BigNumberish,
      _partition: BigNumberish[],
      _collateralToken: string,
      _amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
