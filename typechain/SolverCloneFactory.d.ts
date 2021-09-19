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

interface SolverCloneFactoryInterface extends ethers.utils.Interface {
  functions: {
    "createSolver(address,bytes32,address,address,address,address,uint256,tuple[],bytes)": FunctionFragment;
    "implementationAddress()": FunctionFragment;
    "solvers(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "createSolver",
    values: [
      string,
      BytesLike,
      string,
      string,
      string,
      string,
      BigNumberish,
      {
        to: string;
        executed: boolean;
        useSolverIdx: boolean;
        solverIdx: BigNumberish;
        value: BigNumberish;
        data: BytesLike;
      }[],
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "implementationAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "solvers",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "createSolver",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "implementationAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "solvers", data: BytesLike): Result;

  events: {
    "SolverCreated(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "SolverCreated"): EventFragment;
}

export class SolverCloneFactory extends BaseContract {
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

  interface: SolverCloneFactoryInterface;

  functions: {
    createSolver(
      _conditionalTokens: string,
      _solutionId: BytesLike,
      _proposalsHub: string,
      _solutionsHub: string,
      _keeper: string,
      _arbitrator: string,
      _timelockHours: BigNumberish,
      _actions: {
        to: string;
        executed: boolean;
        useSolverIdx: boolean;
        solverIdx: BigNumberish;
        value: BigNumberish;
        data: BytesLike;
      }[],
      _data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    implementationAddress(overrides?: CallOverrides): Promise<[string]>;

    solvers(arg0: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
  };

  createSolver(
    _conditionalTokens: string,
    _solutionId: BytesLike,
    _proposalsHub: string,
    _solutionsHub: string,
    _keeper: string,
    _arbitrator: string,
    _timelockHours: BigNumberish,
    _actions: {
      to: string;
      executed: boolean;
      useSolverIdx: boolean;
      solverIdx: BigNumberish;
      value: BigNumberish;
      data: BytesLike;
    }[],
    _data: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  implementationAddress(overrides?: CallOverrides): Promise<string>;

  solvers(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    createSolver(
      _conditionalTokens: string,
      _solutionId: BytesLike,
      _proposalsHub: string,
      _solutionsHub: string,
      _keeper: string,
      _arbitrator: string,
      _timelockHours: BigNumberish,
      _actions: {
        to: string;
        executed: boolean;
        useSolverIdx: boolean;
        solverIdx: BigNumberish;
        value: BigNumberish;
        data: BytesLike;
      }[],
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    implementationAddress(overrides?: CallOverrides): Promise<string>;

    solvers(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    SolverCreated(
      newSolverAddress?: null
    ): TypedEventFilter<[string], { newSolverAddress: string }>;
  };

  estimateGas: {
    createSolver(
      _conditionalTokens: string,
      _solutionId: BytesLike,
      _proposalsHub: string,
      _solutionsHub: string,
      _keeper: string,
      _arbitrator: string,
      _timelockHours: BigNumberish,
      _actions: {
        to: string;
        executed: boolean;
        useSolverIdx: boolean;
        solverIdx: BigNumberish;
        value: BigNumberish;
        data: BytesLike;
      }[],
      _data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    implementationAddress(overrides?: CallOverrides): Promise<BigNumber>;

    solvers(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    createSolver(
      _conditionalTokens: string,
      _solutionId: BytesLike,
      _proposalsHub: string,
      _solutionsHub: string,
      _keeper: string,
      _arbitrator: string,
      _timelockHours: BigNumberish,
      _actions: {
        to: string;
        executed: boolean;
        useSolverIdx: boolean;
        solverIdx: BigNumberish;
        value: BigNumberish;
        data: BytesLike;
      }[],
      _data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    implementationAddress(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    solvers(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}