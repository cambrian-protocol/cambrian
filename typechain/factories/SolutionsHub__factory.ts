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
  "0x60a06040527f5fbdb2315678afecb367f032d93f642f64180aa300000000000000000000000060805234801561003457600080fd5b5060805160601c611ce761005360003960006101520152611ce76000f3fe608060405234801561001057600080fd5b50600436106100725760003560e01c806373c587f51161005057806373c587f5146100bd578063b7886a66146100d0578063ee4fdfe6146100e357610072565b8063191481a0146100775780635bd9e299146100a057806360bbb928146100a8575b600080fd5b61008a610085366004610d73565b610103565b6040516100979190611126565b60405180910390f35b61008a610150565b6100bb6100b6366004610d73565b610174565b005b6100bb6100cb366004610d73565b61055e565b6100bb6100de366004610d29565b61062e565b6100f66100f1366004610d94565b610712565b604051610097919061116b565b600082815260208190526040812060060180548390811061013457634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546001600160a01b03169392505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b6000818152602081905260409020600201546001600160a01b031633146101b65760405162461bcd60e51b81526004016101ad906112b3565b60405180910390fd5b60008181526020819052604090206003015482146101e65760405162461bcd60e51b81526004016101ad906111c2565b60008181526020819052604090205460ff16156102155760405162461bcd60e51b81526004016101ad9061118b565b6000818152602081905260409020805460ff191660011790556102378161085c565b336001600160a01b0316631918063f8360008085815260200190815260200160002060060160008154811061027c57634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546040517fffffffff0000000000000000000000000000000000000000000000000000000060e085901b1681526102cb92916001600160a01b031690600401611174565b600060405180830381600087803b1580156102e557600080fd5b505af11580156102f9573d6000803e3d6000fd5b5050505060005b6000828152602081905260409020600501548110156103f657600082815260208190526040812060060180548390811061034a57634e487b7160e01b600052603260045260246000fd5b6000918252602080832090910154858352908290526040918290206003015491517f0d06101a0000000000000000000000000000000000000000000000000000000081526001600160a01b0390911692508291630d06101a916103b0919060040161116b565b600060405180830381600087803b1580156103ca57600080fd5b505af11580156103de573d6000803e3d6000fd5b505050505080806103ee90611792565b915050610300565b506000818152602081905260408120600601805490919061042757634e487b7160e01b600052603260045260246000fd5b60009182526020822001546040517f4a77234e0000000000000000000000000000000000000000000000000000000081526001600160a01b0390911691634a77234e91610477919060040161116b565b600060405180830381600087803b15801561049157600080fd5b505af11580156104a5573d6000803e3d6000fd5b505050600082815260208190526040812060060180549092506104d857634e487b7160e01b600052603260045260246000fd5b60009182526020822001546040517fb992db0f0000000000000000000000000000000000000000000000000000000081526001600160a01b039091169163b992db0f91610528919060040161116b565b600060405180830381600087803b15801561054257600080fd5b505af1158015610556573d6000803e3d6000fd5b505050505050565b6040517fd3f79a05000000000000000000000000000000000000000000000000000000008152339063d3f79a059061059a90859060040161116b565b60206040518083038186803b1580156105b257600080fd5b505afa1580156105c6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105ea9190610d09565b6106065760405162461bcd60e51b81526004016101ad90611256565b60009081526020819052604090206002810180546001600160a01b0319163317905560030155565b60008381526020819052604090206001015483906001600160a01b031633146106695760405162461bcd60e51b81526004016101ad906112ea565b600084815260208190526040812061068691600590910190610a6e565b60005b8281101561070b5760008581526020819052604090206005018484838181106106c257634e487b7160e01b600052603260045260246000fd5b90506020028101906106d49190611426565b8154600181018355600092835260209092209091600e02016106f682826119ea565b5050808061070390611792565b915050610689565b5050505050565b6000848152602081905260408120600401548514156107435760405162461bcd60e51b81526004016101ad906111f9565b6000858152602081905260408120600481018790556001810180546001600160a01b0319163317905580546001600160a01b038716610100027fffffffffffffffffffffff0000000000000000000000000000000000000000ff909116178155905b8381101561081a57816005018585838181106107d157634e487b7160e01b600052603260045260246000fd5b90506020028101906107e39190611426565b8154600181018355600092835260209092209091600e020161080582826119ea565b5050808061081290611792565b9150506107a5565b507faf58c2d61bce90c15ecad6e5142ecbbb0b542b557388df7578e0162b098999a38660405161084a919061116b565b60405180910390a15093949350505050565b6000805b600083815260208190526040902060050154811015610a69578061095d5773e7f1725e7734ce288f8367e1bb143e90bb3f05126001600160a01b0316630df362b460008360008088815260200190815260200160002060050185815481106108d857634e487b7160e01b600052603260045260246000fd5b90600052602060002090600e02016040518463ffffffff1660e01b81526004016109049392919061113a565b602060405180830381600087803b15801561091e57600080fd5b505af1158015610932573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109569190610ce6565b9150610a1f565b816001600160a01b031663a5682cb060008086815260200190815260200160002060050183815481106109a057634e487b7160e01b600052603260045260246000fd5b90600052602060002090600e02016040518263ffffffff1660e01b81526004016109ca9190611321565b602060405180830381600087803b1580156109e457600080fd5b505af11580156109f8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a1c9190610ce6565b91505b6000838152602081815260408220600601805460018101825590835291200180546001600160a01b0319166001600160a01b03841617905580610a6181611792565b915050610860565b505050565b50805460008255600e0290600052602060002090810190610a8f9190610a92565b50565b80821115610b4e5780546001600160a01b03199081168255600182018054821690556002820180549091169055600060038201819055610ad56004830182610b52565b610ae3600583016000610b8e565b6006820180546001600160a01b03191681556000600784018190556008840181905560098401819055610b19600a850182610baf565b610b27600583016000610baf565b610b35600683016000610bcd565b610b43600783016000610beb565b505050600e01610a92565b5090565b508054610b5e90611744565b6000825580601f10610b705750610a8f565b601f016020900490600052602060002090810190610a8f9190610c0c565b5080546000825560050290600052602060002090810190610a8f9190610c21565b5080546000825590600052602060002090810190610a8f9190610c0c565b5080546000825590600052602060002090810190610a8f9190610c5e565b5080546000825560020290600052602060002090810190610a8f9190610c7b565b5b80821115610b4e5760008155600101610c0d565b80821115610b4e57600080825560018201805460ff191690556002820181905560038201819055610c556004830182610b52565b50600501610c21565b80821115610b4e576000610c728282610baf565b50600101610c5e565b5b80821115610b4e576000815560018101805461ffff19169055600201610c7c565b60008083601f840112610cae578182fd5b50813567ffffffffffffffff811115610cc5578182fd5b6020830191508360208083028501011115610cdf57600080fd5b9250929050565b600060208284031215610cf7578081fd5b8151610d0281611c9c565b9392505050565b600060208284031215610d1a578081fd5b81518015158114610d02578182fd5b600080600060408486031215610d3d578182fd5b83359250602084013567ffffffffffffffff811115610d5a578283fd5b610d6686828701610c9d565b9497909650939450505050565b60008060408385031215610d85578182fd5b50508035926020909101359150565b60008060008060608587031215610da9578081fd5b843593506020850135610dbb81611c9c565b9250604085013567ffffffffffffffff811115610dd6578182fd5b610de287828801610c9d565b95989497509550505050565b6001600160a01b03169052565b60008282548085526020808601955080818302840101858552818520855b84811015610e4657858303601f19018952610e348383610f4c565b98840198925060019182019101610e19565b5090979650505050505050565b60008282548085526020808601955080818302840101858552818520855b84811015610e4657601f1986840301895260a08254845260ff6001840154166003808210610ead57634e487b7160e01b8a52602160045260248afd5b8187870152600285015460408701528085015460608701525050806080850152610edc81850160048501610f7e565b9985019993505060059190910190600101610e71565b6000815480845260208085019450838352808320835b83811015610f41578154875260018083015460ff808216868b015260089190911c16604089015260609097019660029092019101610f08565b509495945050505050565b6000815480845260208085019450838352808320835b83811015610f4157815487529582019560019182019101610f62565b60008154610f8b81611744565b808552602060018381168015610fa85760018114610fbc57610fea565b60ff19851688840152604088019550610fea565b866000528260002060005b85811015610fe25781548a8201860152908301908401610fc7565b890184019650505b505050505092915050565b600061010061100d846110088554611501565b610dee565b60018301546020850152600283015460408501526003830154606085015280608085015261104081850160048501610f4c565b905083810360a08501526110578160058501610f4c565b905083810360c085015261106e8160068501610dfb565b905083810360e08501526110858160078501610ef2565b949350505050565b60006110a3836001600160a01b03845416610dee565b6110b06001830154611501565b6110bd6020850182610dee565b506110cb6002830154611501565b6110d86040850182610dee565b506003820154606084015260e060808401526110fa60e0840160048401610f7e565b83810360a085015261110f8160058501610e53565b905083810360c08501526110858160068501610ff5565b6001600160a01b0391909116815260200190565b60006001600160a01b038516825283602083015260606040830152611162606083018461108d565b95945050505050565b90815260200190565b9182526001600160a01b0316602082015260400190565b60208082526019908201527f536f6c7574696f6e20616c726561647920657865637574656400000000000000604082015260600190565b60208082526010908201527f57726f6e672070726f706f73616c496400000000000000000000000000000000604082015260600190565b60208082526024908201527f536f6c7574696f6e734875623a3a5468697320494420616c726561647920657860408201527f6973747300000000000000000000000000000000000000000000000000000000606082015260800190565b60208082526024908201527f50726f706f73616c206973206e6f742076616c69642061742070726f706f736160408201527f6c48756200000000000000000000000000000000000000000000000000000000606082015260800190565b60208082526017908201527f4e6f7420636f72726563742070726f706f73616c487562000000000000000000604082015260600190565b60208082526018908201527f536f6c7574696f6e734875623a206f6e6c794b65657065720000000000000000604082015260600190565b600060208252610d02602083018461108d565b6000808335601e1984360301811261134a578283fd5b83018035915067ffffffffffffffff821115611364578283fd5b6020908101925081023603821315610cdf57600080fd5b6000808335601e19843603018112611391578182fd5b83018035915067ffffffffffffffff8211156113ab578283fd5b6020019150606081023603821315610cdf57600080fd5b6000808335601e198436030181126113d8578182fd5b83018035915067ffffffffffffffff8211156113f2578283fd5b602001915036819003821315610cdf57600080fd5b6000823560fe1983360301811261141c578182fd5b9190910192915050565b6000823560de1983360301811261141c578182fd5b60008235609e1983360301811261141c578182fd5b60009081526020902090565b6020841080156114b257601f8411600181146114835761147c868561177f565b83556114ac565b61148c83611450565b6114a16020601f88010482016001830161150d565b506114ac868461185e565b5061070b565b8160005260206000206020601f8701048101601f871680156114dc576114dc8160001984016117ef565b506114ef6020601f88010483018261150d565b50506001856002021782555050505050565b6001600160a01b031690565b5b81811015611522576000815560010161150e565b5050565b6801000000000000000083111561153f5761153f6117d9565b8054838255808410156115d7577f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6001818311811615611581576115816117c3565b6002828711821615611595576115956117c3565b600085815260208120909350878202810190828602015b808210156115d1576115c08586845461187c565b8255848483015582820191506115ac565b50505050505b50816115e282611450565b6000805b8681101561160f576115f9848385611c4a565b60609390930192600292909201916001016115e6565b50505050505050565b611622838261181b565b818160005260208060002060005b8681101561160f57833582559282019260019182019101611630565b67ffffffffffffffff831115611664576116646117d9565b61166e8154611744565b600080601f8611601f84118181171561168d5761168a86611450565b92505b80156116bc576020601f890104830160208910156116a85750825b6116ba6020601f88010485018261150d565b505b5080600181146116e8576000945087156116d7578387013594505b6116e1888661177f565b865561173a565b601f198816945082845b8681101561171257888601358255602095860195600190920191016116f2565b508886101561172f57878501356000196008601f8c16021c191681555b506001600289020186555b5050505050505050565b60028104600182168061175857607f821691505b6020821081141561177957634e487b7160e01b600052602260045260246000fd5b50919050565b600019600883021c191660029091021790565b60006000198214156117a6576117a66117c3565b5060010190565b634e487b7160e01b600052600060045260246000fd5b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b8054600019836020036008021c1681555050565b6000813560ff81168114611815578182fd5b92915050565b68010000000000000000821115611834576118346117d9565b805482825580831015610a695781600052602060002061185882820185830161150d565b50505050565b80600052602060002061187283825461177f565b9091556000905550565b60089190910291821b60001990921b9182169119161790565b6001600160a01b0382166001600160a01b03198254161781555050565b81356118bd81611c9c565b6118c78183611895565b5060016020808401358284015560408401356002840155606084013560038401556118f56080850185611334565b611903818360048801611618565b505061191260a0850185611334565b611920818360058801611618565b50506006830161193360c0860186611334565b6801000000000000000081111561194c5761194c6117d9565b8254818455808210156119875760008481528581208381019083015b808210156119835761197a838361181b565b90880190611968565b5050505b508161199284611450565b93506000805b838110156119c7576119aa8386611334565b6119b68183868b611bc9565b505094870194918601918701611998565b50505050505050506119dc60e083018361137b565b611858818360078601611526565b81356119f581611c9c565b6119ff8183611895565b506001602080840135611a1181611c9c565b611a1d81848601611895565b5060026040850135611a2e81611c9c565b611a3a81838701611895565b5060036060860135818601556004611a5560808801886113c2565b611a628183858b0161164c565b50506005808701611a7660a08a018a611334565b68010000000000000000811115611a8f57611a8f6117d9565b825481845580821015611b63577f33333333333333333333333333333333333333333333333333333333333333338082118b1615611acf57611acf6117c3565b8083118b1615611ae157611ae16117c3565b506000848152898120838702810190878402015b80821015611b5f57611b098384845461187c565b8255828d8301558a8201611b1f8485835461187c565b815550898201611b318485835461187c565b90558189018054611b4181611744565b8015611b5357611b538682848661145c565b50505090870190611af5565b5050505b50819650611b7083611450565b9550600094508492505b80831015611ba757611b96611b8f888461143b565b8688611be2565b958701959483019491880191611b7a565b505050505050505050611522611bc060c0840184611407565b600683016118b2565b8115611bd757611bd76117ad565b611858848483611618565b8115611bf057611bf06117ad565b8235815560018101602084013560038110611c0a57600080fd5b60ff1982541660ff8216811783555050506040830135600282015560608301356003820155611c3c60808401846113c2565b61070b81836004860161164c565b8115611c5857611c586117ad565b823581556001810160ff611c6e60208601611803565b1660ff198254161780825561ff00611c8860408701611803565b60081b1661ff001982161782555050505050565b6001600160a01b0381168114610a8f57600080fdfea26469706673582212201ec65bf8a084bb9786c932c8d406edb825b25dc27442f15629206770c9314b4d64736f6c63430008000033";

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
