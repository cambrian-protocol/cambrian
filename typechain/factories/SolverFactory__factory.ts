/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { SolverFactory, SolverFactoryInterface } from "../SolverFactory";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newSolverAddress",
        type: "address",
      },
    ],
    name: "SolverCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "chainParent",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "chainIndex",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "contract Solver",
            name: "implementation",
            type: "address",
          },
          {
            internalType: "address",
            name: "keeper",
            type: "address",
          },
          {
            internalType: "address",
            name: "arbitrator",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "timelockSeconds",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "executions",
                type: "uint256",
              },
              {
                internalType: "enum SolverLib.IngestType",
                name: "ingestType",
                type: "uint8",
              },
              {
                internalType: "uint256",
                name: "slot",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "solverIndex",
                type: "uint256",
              },
              {
                internalType: "bytes",
                name: "data",
                type: "bytes",
              },
            ],
            internalType: "struct SolverLib.Ingest[]",
            name: "ingests",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "contract IERC20",
                name: "collateralToken",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "outcomeSlots",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "parentCollectionIndexSet",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "amountSlot",
                type: "uint256",
              },
              {
                internalType: "uint256[]",
                name: "partition",
                type: "uint256[]",
              },
              {
                internalType: "uint256[]",
                name: "recipientAddressSlots",
                type: "uint256[]",
              },
              {
                internalType: "uint256[][]",
                name: "recipientAmountSlots",
                type: "uint256[][]",
              },
              {
                components: [
                  {
                    internalType: "bytes32",
                    name: "digest",
                    type: "bytes32",
                  },
                  {
                    internalType: "uint8",
                    name: "hashFunction",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "size",
                    type: "uint8",
                  },
                ],
                internalType: "struct SolverLib.Multihash[]",
                name: "outcomeURIs",
                type: "tuple[]",
              },
            ],
            internalType: "struct SolverLib.ConditionBase",
            name: "conditionBase",
            type: "tuple",
          },
        ],
        internalType: "struct SolverLib.Config",
        name: "solverConfig",
        type: "tuple",
      },
    ],
    name: "createSolver",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "solvers",
    outputs: [
      {
        internalType: "contract Solver",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061095f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80630df362b41461003b57806392ce765e14610064575b600080fd5b61004e6100493660046102fb565b610077565b60405161005b9190610648565b60405180910390f35b61004e61007236600461037b565b61023b565b6000806100876020840184610358565b6001600160a01b031614156100b75760405162461bcd60e51b81526004016100ae90610783565b60405180910390fd5b6001600160a01b0384161580156100cc575082155b806100ea57506001600160a01b038416158015906100ea5750600083115b6101065760405162461bcd60e51b81526004016100ae906107e0565b600061011d6101186020850185610358565b610265565b6040517f499f5af30000000000000000000000000000000000000000000000000000000081529091506001600160a01b0382169063499f5af3906101699088908890889060040161065c565b600060405180830381600087803b15801561018357600080fd5b505af1158015610197573d6000803e3d6000fd5b5050600080546001810182559080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5630180547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b03851617905550506040517ff209a592917f50f3a35587a0febcddc6d39633e81c51e5a8e4c0a4b1da8532859061022b908390610648565b60405180910390a1949350505050565b6000818154811061024b57600080fd5b6000918252602090912001546001600160a01b0316905081565b60006040517f3d602d80600a3d3981f3363d3d373d3d3d363d7300000000000000000000000081528260601b60148201527f5af43d82803e903d91602b57fd5bf3000000000000000000000000000000000060288201526037816000f09150506001600160a01b0381166102eb5760405162461bcd60e51b81526004016100ae9061074c565b919050565b80356102eb81610911565b60008060006060848603121561030f578283fd5b833561031a81610911565b925060208401359150604084013567ffffffffffffffff81111561033c578182fd5b840160e0818703121561034d578182fd5b809150509250925092565b600060208284031215610369578081fd5b813561037481610911565b9392505050565b60006020828403121561038c578081fd5b5035919050565b6001600160a01b03169052565b818352602080840193600091908185020181018584845b878110156103ed5782840389526103ce8288610817565b6103d9868284610506565b9a87019a95505050908401906001016103b7565b5091979650505050505050565b818352602080840193600091908185020181018584845b878110156103ed5782840389528135609e19883603018112610431578687fd5b87018035855260a08682013560038110610449578889fd5b868801526040828101359087015260608083013590870152608061046f818401846108ae565b935082828901526104838389018583610553565b9c89019c97505050928601925050600101610411565b60008284526020808501945082825b858110156104fb57813587528282013560ff8082168083146104c8578687fd5b898601526040915083820135908116908181146104e3578687fd5b509088015260609687019691909101906001016104a8565b509495945050505050565b60008284527f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff831115610537578081fd5b6020830280836020870137939093016020019283525090919050565b60008284528282602086013780602084860101526020601f19601f85011685010190509392505050565b60006101006105948461058f856102f0565b610393565b6020830135602085015260408301356040850152606083013560608501526105bf6080840184610817565b8260808701526105d28387018284610506565b925050506105e360a0840184610817565b85830360a08701526105f6838284610506565b9250505061060760c0840184610817565b85830360c087015261061a8382846103a0565b9250505061062b60e0840184610866565b85830360e087015261063e838284610499565b9695505050505050565b6001600160a01b0391909116815260200190565b60006001600160a01b038516825283602083015260606040830152823561068281610911565b61068f6060840182610393565b5061069c602084016102f0565b6106a96080840182610393565b506106b6604084016102f0565b6106c360a0840182610393565b50606083013560c08301526106db60808401846108ae565b60e0808501526106f061014085018284610553565b91505061070060a0850185610817565b605f1980868503016101008701526107198483856103fa565b935061072860c08801886108f3565b925080868503016101208701525050610741828261057d565b979650505050505050565b60208082526016908201527f455243313136373a20637265617465206661696c656400000000000000000000604082015260600190565b6020808252602d908201527f536f6c766572466163746f72793a3a496e76616c696420696d706c656d656e7460408201527f6174696f6e206164647265737300000000000000000000000000000000000000606082015260800190565b6020808252601a908201527f496e76616c696420636861696e20706172656e742f696e646578000000000000604082015260600190565b6000808335601e1984360301811261082d578283fd5b830160208101925035905067ffffffffffffffff81111561084d57600080fd5b60208102360383131561085f57600080fd5b9250929050565b6000808335601e1984360301811261087c578283fd5b830160208101925035905067ffffffffffffffff81111561089c57600080fd5b60608102360383131561085f57600080fd5b6000808335601e198436030181126108c4578283fd5b830160208101925035905067ffffffffffffffff8111156108e457600080fd5b80360383131561085f57600080fd5b6000823560fe19833603018112610908578182fd5b90910192915050565b6001600160a01b038116811461092657600080fd5b5056fea2646970667358221220cc4d9ba9232176f0feec7ca9466f03aa530dc7170e77c7816db2cd31b11760e464736f6c63430008000033";

export class SolverFactory__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<SolverFactory> {
    return super.deploy(overrides || {}) as Promise<SolverFactory>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): SolverFactory {
    return super.attach(address) as SolverFactory;
  }
  connect(signer: Signer): SolverFactory__factory {
    return super.connect(signer) as SolverFactory__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SolverFactoryInterface {
    return new utils.Interface(_abi) as SolverFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SolverFactory {
    return new Contract(address, _abi, signerOrProvider) as SolverFactory;
  }
}
