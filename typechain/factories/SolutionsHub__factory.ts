/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { SolutionsHub, SolutionsHubInterface } from "../SolutionsHub";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "CreateSolution",
    type: "event",
  },
  {
    inputs: [],
    name: "conditionalTokens",
    outputs: [
      {
        internalType: "contract ConditionalTokens",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_id",
        type: "bytes32",
      },
      {
        internalType: "contract IERC20",
        name: "_collateralToken",
        type: "address",
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
                name: "key",
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
                internalType: "string",
                name: "conditionURI",
                type: "string",
              },
            ],
            internalType: "struct SolverLib.ConditionBase",
            name: "conditionBase",
            type: "tuple",
          },
        ],
        internalType: "struct SolverLib.Config[]",
        name: "_solverConfigs",
        type: "tuple[]",
      },
    ],
    name: "createSolution",
    outputs: [
      {
        internalType: "bytes32",
        name: "_solutionId",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_proposalId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_solutionId",
        type: "bytes32",
      },
    ],
    name: "executeSolution",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_proposalId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_solutionId",
        type: "bytes32",
      },
    ],
    name: "linkToProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_solutionId",
        type: "bytes32",
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
                name: "key",
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
                internalType: "string",
                name: "conditionURI",
                type: "string",
              },
            ],
            internalType: "struct SolverLib.ConditionBase",
            name: "conditionBase",
            type: "tuple",
          },
        ],
        internalType: "struct SolverLib.Config[]",
        name: "_solverConfigs",
        type: "tuple[]",
      },
    ],
    name: "setSolverConfigs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_solutionId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "solverFromIndex",
    outputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60a06040527f5fbdb2315678afecb367f032d93f642f64180aa300000000000000000000000060805234801561003457600080fd5b5060805160601c611ab561005360003960006101520152611ab56000f3fe608060405234801561001057600080fd5b50600436106100725760003560e01c806373c587f51161005057806373c587f5146100bd578063aaeffa0b146100d0578063d88368a4146100e357610072565b8063191481a0146100775780635bd9e299146100a057806360bbb928146100a8575b600080fd5b61008a610085366004610d30565b610103565b6040516100979190611094565b60405180910390f35b61008a610150565b6100bb6100b6366004610d30565b610174565b005b6100bb6100cb366004610d30565b61055e565b6100bb6100de366004610ce6565b61062e565b6100f66100f1366004610d51565b610712565b60405161009791906110d9565b600082815260208190526040812060060180548390811061013457634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546001600160a01b03169392505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b6000818152602081905260409020600201546001600160a01b031633146101b65760405162461bcd60e51b81526004016101ad90611221565b60405180910390fd5b60008181526020819052604090206003015482146101e65760405162461bcd60e51b81526004016101ad90611130565b60008181526020819052604090205460ff16156102155760405162461bcd60e51b81526004016101ad906110f9565b6000818152602081905260409020805460ff191660011790556102378161085c565b336001600160a01b0316631918063f8360008085815260200190815260200160002060060160008154811061027c57634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546040517fffffffff0000000000000000000000000000000000000000000000000000000060e085901b1681526102cb92916001600160a01b0316906004016110e2565b600060405180830381600087803b1580156102e557600080fd5b505af11580156102f9573d6000803e3d6000fd5b5050505060005b6000828152602081905260409020600501548110156103f657600082815260208190526040812060060180548390811061034a57634e487b7160e01b600052603260045260246000fd5b6000918252602080832090910154858352908290526040918290206003015491517f0d06101a0000000000000000000000000000000000000000000000000000000081526001600160a01b0390911692508291630d06101a916103b091906004016110d9565b600060405180830381600087803b1580156103ca57600080fd5b505af11580156103de573d6000803e3d6000fd5b505050505080806103ee906115d0565b915050610300565b506000818152602081905260408120600601805490919061042757634e487b7160e01b600052603260045260246000fd5b60009182526020822001546040517f4a77234e0000000000000000000000000000000000000000000000000000000081526001600160a01b0390911691634a77234e9161047791906004016110d9565b600060405180830381600087803b15801561049157600080fd5b505af11580156104a5573d6000803e3d6000fd5b505050600082815260208190526040812060060180549092506104d857634e487b7160e01b600052603260045260246000fd5b60009182526020822001546040517fb992db0f0000000000000000000000000000000000000000000000000000000081526001600160a01b039091169163b992db0f9161052891906004016110d9565b600060405180830381600087803b15801561054257600080fd5b505af1158015610556573d6000803e3d6000fd5b505050505050565b6040517fd3f79a05000000000000000000000000000000000000000000000000000000008152339063d3f79a059061059a9085906004016110d9565b60206040518083038186803b1580156105b257600080fd5b505afa1580156105c6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105ea9190610cc6565b6106065760405162461bcd60e51b81526004016101ad906111c4565b60009081526020819052604090206002810180546001600160a01b0319163317905560030155565b60008381526020819052604090206001015483906001600160a01b031633146106695760405162461bcd60e51b81526004016101ad90611258565b600084815260208190526040812061068691600590910190610a6e565b60005b8281101561070b5760008581526020819052604090206005018484838181106106c257634e487b7160e01b600052603260045260246000fd5b90506020028101906106d4919061134d565b8154600181018355600092835260209092209091600e02016106f682826117f7565b50508080610703906115d0565b915050610689565b5050505050565b6000848152602081905260408120600401548514156107435760405162461bcd60e51b81526004016101ad90611167565b6000858152602081905260408120600481018790556001810180546001600160a01b0319163317905580546001600160a01b038716610100027fffffffffffffffffffffff0000000000000000000000000000000000000000ff909116178155905b8381101561081a57816005018585838181106107d157634e487b7160e01b600052603260045260246000fd5b90506020028101906107e3919061134d565b8154600181018355600092835260209092209091600e020161080582826117f7565b50508080610812906115d0565b9150506107a5565b507faf58c2d61bce90c15ecad6e5142ecbbb0b542b557388df7578e0162b098999a38660405161084a91906110d9565b60405180910390a15093949350505050565b6000805b600083815260208190526040902060050154811015610a69578061095d5773e7f1725e7734ce288f8367e1bb143e90bb3f05126001600160a01b031663c31031d560008360008088815260200190815260200160002060050185815481106108d857634e487b7160e01b600052603260045260246000fd5b90600052602060002090600e02016040518463ffffffff1660e01b8152600401610904939291906110a8565b602060405180830381600087803b15801561091e57600080fd5b505af1158015610932573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109569190610ca3565b9150610a1f565b816001600160a01b0316639f9ecd5c60008086815260200190815260200160002060050183815481106109a057634e487b7160e01b600052603260045260246000fd5b90600052602060002090600e02016040518263ffffffff1660e01b81526004016109ca919061128f565b602060405180830381600087803b1580156109e457600080fd5b505af11580156109f8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a1c9190610ca3565b91505b6000838152602081815260408220600601805460018101825590835291200180546001600160a01b0319166001600160a01b03841617905580610a61816115d0565b915050610860565b505050565b50805460008255600e0290600052602060002090810190610a8f9190610a92565b50565b80821115610b4e5780546001600160a01b03199081168255600182018054821690556002820180549091169055600060038201819055610ad56004830182610b52565b610ae3600583016000610b8e565b6006820180546001600160a01b03191681556000600784018190556008840181905560098401819055610b19600a850182610baf565b610b27600583016000610baf565b610b35600683016000610bcd565b610b43600783016000610b52565b505050600e01610a92565b5090565b508054610b5e90611582565b6000825580601f10610b705750610a8f565b601f016020900490600052602060002090810190610a8f9190610beb565b5080546000825560050290600052602060002090810190610a8f9190610c00565b5080546000825590600052602060002090810190610a8f9190610beb565b5080546000825590600052602060002090810190610a8f9190610c3d565b5b80821115610b4e5760008155600101610bec565b80821115610b4e57600080825560018201805460ff191690556002820181905560038201819055610c346004830182610b52565b50600501610c00565b80821115610b4e576000610c518282610baf565b50600101610c3d565b60008083601f840112610c6b578182fd5b50813567ffffffffffffffff811115610c82578182fd5b6020830191508360208083028501011115610c9c57600080fd5b9250929050565b600060208284031215610cb4578081fd5b8151610cbf81611a6a565b9392505050565b600060208284031215610cd7578081fd5b81518015158114610cbf578182fd5b600080600060408486031215610cfa578182fd5b83359250602084013567ffffffffffffffff811115610d17578283fd5b610d2386828701610c5a565b9497909650939450505050565b60008060408385031215610d42578182fd5b50508035926020909101359150565b60008060008060608587031215610d66578081fd5b843593506020850135610d7881611a6a565b9250604085013567ffffffffffffffff811115610d93578182fd5b610d9f87828801610c5a565b95989497509550505050565b6001600160a01b03169052565b60008282548085526020808601955080818302840101858552818520855b84811015610e0357858303601f19018952610df18383610eaf565b98840198925060019182019101610dd6565b5090979650505050505050565b60008282548085526020808601955080818302840101858552818520855b84811015610e0357601f1986840301895260a08254845260ff6001840154166003808210610e6a57634e487b7160e01b8a52602160045260248afd5b8187870152600285015460408701528085015460608701525050806080850152610e9981850160048501610eec565b9985019993505060059190910190600101610e2e565b6000815480845260208085019450838352808320835b83811015610ee157815487529582019560019182019101610ec5565b509495945050505050565b60008154610ef981611582565b808552602060018381168015610f165760018114610f2a57610f58565b60ff19851688840152604088019550610f58565b866000528260002060005b85811015610f505781548a8201860152908301908401610f35565b890184019650505b505050505092915050565b6000610100610f7b84610f768554611428565b610dab565b600183015460208501526002830154604085015260038301546060850152806080850152610fae81850160048501610eaf565b905083810360a0850152610fc58160058501610eaf565b905083810360c0850152610fdc8160068501610db8565b905083810360e0850152610ff38160078501610eec565b949350505050565b6000611011836001600160a01b03845416610dab565b61101e6001830154611428565b61102b6020850182610dab565b506110396002830154611428565b6110466040850182610dab565b506003820154606084015260e0608084015261106860e0840160048401610eec565b83810360a085015261107d8160058501610e10565b905083810360c0850152610ff38160068501610f63565b6001600160a01b0391909116815260200190565b60006001600160a01b0385168252836020830152606060408301526110d06060830184610ffb565b95945050505050565b90815260200190565b9182526001600160a01b0316602082015260400190565b60208082526019908201527f536f6c7574696f6e20616c726561647920657865637574656400000000000000604082015260600190565b60208082526010908201527f57726f6e672070726f706f73616c496400000000000000000000000000000000604082015260600190565b60208082526024908201527f536f6c7574696f6e734875623a3a5468697320494420616c726561647920657860408201527f6973747300000000000000000000000000000000000000000000000000000000606082015260800190565b60208082526024908201527f50726f706f73616c206973206e6f742076616c69642061742070726f706f736160408201527f6c48756200000000000000000000000000000000000000000000000000000000606082015260800190565b60208082526017908201527f4e6f7420636f72726563742070726f706f73616c487562000000000000000000604082015260600190565b60208082526018908201527f536f6c7574696f6e734875623a206f6e6c794b65657065720000000000000000604082015260600190565b600060208252610cbf6020830184610ffb565b6000808335601e198436030181126112b8578283fd5b83018035915067ffffffffffffffff8211156112d2578283fd5b6020908101925081023603821315610c9c57600080fd5b6000808335601e198436030181126112ff578182fd5b83018035915067ffffffffffffffff821115611319578283fd5b602001915036819003821315610c9c57600080fd5b6000823560fe19833603018112611343578182fd5b9190910192915050565b6000823560de19833603018112611343578182fd5b60008235609e19833603018112611343578182fd5b60009081526020902090565b6020841080156113d957601f8411600181146113aa576113a386856115bd565b83556113d3565b6113b383611377565b6113c86020601f880104820160018301611434565b506113d38684611684565b5061070b565b8160005260206000206020601f8701048101601f871680156114035761140381600019840161162d565b506114166020601f880104830182611434565b50506001856002021782555050505050565b6001600160a01b031690565b5b818110156114495760008155600101611435565b5050565b6114578382611641565b818160005260208060002060005b8681101561148157833582559282019260019182019101611465565b50505050505050565b67ffffffffffffffff8311156114a2576114a2611617565b6114ac8154611582565b600080601f8611601f8411818117156114cb576114c886611377565b92505b80156114fa576020601f890104830160208910156114e65750825b6114f86020601f880104850182611434565b505b50806001811461152657600094508715611515578387013594505b61151f88866115bd565b8655611578565b601f198816945082845b868110156115505788860135825560209586019560019092019101611530565b508886101561156d57878501356000196008601f8c16021c191681555b506001600289020186555b5050505050505050565b60028104600182168061159657607f821691505b602082108114156115b757634e487b7160e01b600052602260045260246000fd5b50919050565b600019600883021c191660029091021790565b60006000198214156115e4576115e4611601565b5060010190565b634e487b7160e01b600052600060045260246000fd5b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b8054600019836020036008021c1681555050565b6801000000000000000082111561165a5761165a611617565b805482825580831015610a695781600052602060002061167e828201858301611434565b50505050565b8060005260206000206116988382546115bd565b9091556000905550565b6001600160a01b0382166001600160a01b03198254161781555050565b81356116ca81611a6a565b6116d481836116a2565b50600160208084013582840155604084013560028401556060840135600384015561170260808501856112a2565b61171081836004880161144d565b505061171f60a08501856112a2565b61172d81836005880161144d565b50506006830161174060c08601866112a2565b6801000000000000000081111561175957611759611617565b8254818455808210156117945760008481528581208381019083015b80821015611790576117878383611641565b90880190611775565b5050505b508161179f84611377565b93506000805b838110156117d4576117b783866112a2565b6117c38183868b6119ca565b5050948701949186019187016117a5565b50505050505050506117e960e08301836112e9565b61167e81836007860161148a565b813561180281611a6a565b61180c81836116a2565b50600160208084013561181e81611a6a565b61182a818486016116a2565b506002604085013561183b81611a6a565b611847818387016116a2565b506003606086013581860155600461186260808801886112e9565b61186f8183858b0161148a565b5050600580870161188360a08a018a6112a2565b6801000000000000000081111561189c5761189c611617565b825481845580821015611964577f33333333333333333333333333333333333333333333333333333333333333338082118b16156118dc576118dc611601565b8083118b16156118ee576118ee611601565b506000848152898120838702810190878402015b8082101561196057611915838484611a4b565b828d83015561192783848d8501611a4b565b61193483848c8501611a4b565b888201805461194281611582565b80156119545761195486828486611383565b50505090870190611902565b5050505b5081965061197183611377565b9550600094508492505b808310156119a8576119976119908884611362565b86886119e3565b95870195948301949188019161197b565b5050505050505050506114496119c160c084018461132e565b600683016116bf565b81156119d8576119d86115eb565b61167e84848361144d565b81156119f1576119f16115eb565b8235815560018101602084013560038110611a0b57600080fd5b60ff1982541660ff8216811783555050506040830135600282015560608301356003820155611a3d60808401846112e9565b61070b81836004860161148a565b805460088302600019811b8086831b1681198416178455505050505050565b6001600160a01b0381168114610a8f57600080fdfea2646970667358221220022465ea6f718723a978ee79ddab6e952596b35a7d3c61f3f2bbca2441609c6564736f6c63430008000033";

export class SolutionsHub__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<SolutionsHub> {
    return super.deploy(overrides || {}) as Promise<SolutionsHub>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): SolutionsHub {
    return super.attach(address) as SolutionsHub;
  }
  connect(signer: Signer): SolutionsHub__factory {
    return super.connect(signer) as SolutionsHub__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SolutionsHubInterface {
    return new utils.Interface(_abi) as SolutionsHubInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SolutionsHub {
    return new Contract(address, _abi, signerOrProvider) as SolutionsHub;
  }
}
