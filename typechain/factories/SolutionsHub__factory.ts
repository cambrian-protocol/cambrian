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
                internalType: "bool",
                name: "isDeferred",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isConstant",
                type: "bool",
              },
              {
                internalType: "uint8",
                name: "dataType",
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
                internalType: "bool",
                name: "isDeferred",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isConstant",
                type: "bool",
              },
              {
                internalType: "uint8",
                name: "dataType",
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
  "0x60a06040527f5fbdb2315678afecb367f032d93f642f64180aa300000000000000000000000060805234801561003457600080fd5b5060805160601c611b4361005360003960006102a50152611b436000f3fe608060405234801561001057600080fd5b50600436106100725760003560e01c806360bbb9281161005057806360bbb928146100c857806373c587f5146100dd578063b763ed0f146100f057610072565b80631224e05a14610077578063191481a0146100a05780635bd9e299146100c0575b600080fd5b61008a610085366004610d4f565b610103565b60405161009791906110ee565b60405180910390f35b6100b36100ae366004610d2e565b610256565b60405161009791906110a9565b6100b36102a3565b6100db6100d6366004610d2e565b6102c7565b005b6100db6100eb366004610d2e565b6106a8565b6100db6100fe366004610ce4565b610778565b60008481526020819052604081206004015485141561013d5760405162461bcd60e51b81526004016101349061117c565b60405180910390fd5b6000858152602081905260408120600481018790556001810180546001600160a01b0319163317905580546001600160a01b038716610100027fffffffffffffffffffffff0000000000000000000000000000000000000000ff909116178155905b8381101561021457816005018585838181106101cb57634e487b7160e01b600052603260045260246000fd5b90506020028101906101dd9190611362565b8154600181018355600092835260209092209091600e02016101ff828261181c565b5050808061020c906115d0565b91505061019f565b507faf58c2d61bce90c15ecad6e5142ecbbb0b542b557388df7578e0162b098999a38660405161024491906110ee565b60405180910390a15093949350505050565b600082815260208190526040812060060180548390811061028757634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546001600160a01b03169392505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b6000818152602081905260409020600201546001600160a01b031633146103005760405162461bcd60e51b815260040161013490611236565b60008181526020819052604090206003015482146103305760405162461bcd60e51b815260040161013490611145565b60008181526020819052604090205460ff161561035f5760405162461bcd60e51b81526004016101349061110e565b6000818152602081905260409020805460ff191660011790556103818161085c565b336001600160a01b0316631918063f836000808581526020019081526020016000206006016000815481106103c657634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546040517fffffffff0000000000000000000000000000000000000000000000000000000060e085901b16815261041592916001600160a01b0316906004016110f7565b600060405180830381600087803b15801561042f57600080fd5b505af1158015610443573d6000803e3d6000fd5b5050505060005b60008281526020819052604090206005015481101561054057600082815260208190526040812060060180548390811061049457634e487b7160e01b600052603260045260246000fd5b6000918252602080832090910154858352908290526040918290206003015491517f0d06101a0000000000000000000000000000000000000000000000000000000081526001600160a01b0390911692508291630d06101a916104fa91906004016110ee565b600060405180830381600087803b15801561051457600080fd5b505af1158015610528573d6000803e3d6000fd5b50505050508080610538906115d0565b91505061044a565b506000818152602081905260408120600601805490919061057157634e487b7160e01b600052603260045260246000fd5b60009182526020822001546040517f4a77234e0000000000000000000000000000000000000000000000000000000081526001600160a01b0390911691634a77234e916105c191906004016110ee565b600060405180830381600087803b1580156105db57600080fd5b505af11580156105ef573d6000803e3d6000fd5b5050506000828152602081905260408120600601805490925061062257634e487b7160e01b600052603260045260246000fd5b60009182526020822001546040517fb992db0f0000000000000000000000000000000000000000000000000000000081526001600160a01b039091169163b992db0f9161067291906004016110ee565b600060405180830381600087803b15801561068c57600080fd5b505af11580156106a0573d6000803e3d6000fd5b505050505050565b6040517fd3f79a05000000000000000000000000000000000000000000000000000000008152339063d3f79a05906106e49085906004016110ee565b60206040518083038186803b1580156106fc57600080fd5b505afa158015610710573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107349190610cc8565b6107505760405162461bcd60e51b8152600401610134906111d9565b60009081526020819052604090206002810180546001600160a01b0319163317905560030155565b60008381526020819052604090206001015483906001600160a01b031633146107b35760405162461bcd60e51b81526004016101349061126d565b60008481526020819052604081206107d091600590910190610a6e565b60005b8281101561085557600085815260208190526040902060050184848381811061080c57634e487b7160e01b600052603260045260246000fd5b905060200281019061081e9190611362565b8154600181018355600092835260209092209091600e0201610840828261181c565b5050808061084d906115d0565b9150506107d3565b5050505050565b6000805b600083815260208190526040902060050154811015610a69578061095d5773e7f1725e7734ce288f8367e1bb143e90bb3f05126001600160a01b031663e4445ce660008360008088815260200190815260200160002060050185815481106108d857634e487b7160e01b600052603260045260246000fd5b90600052602060002090600e02016040518463ffffffff1660e01b8152600401610904939291906110bd565b602060405180830381600087803b15801561091e57600080fd5b505af1158015610932573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109569190610ca5565b9150610a1f565b816001600160a01b03166317f9447f60008086815260200190815260200160002060050183815481106109a057634e487b7160e01b600052603260045260246000fd5b90600052602060002090600e02016040518263ffffffff1660e01b81526004016109ca91906112a4565b602060405180830381600087803b1580156109e457600080fd5b505af11580156109f8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a1c9190610ca5565b91505b6000838152602081815260408220600601805460018101825590835291200180546001600160a01b0319166001600160a01b03841617905580610a61816115d0565b915050610860565b505050565b50805460008255600e0290600052602060002090810190610a8f9190610a92565b50565b80821115610b4e5780546001600160a01b03199081168255600182018054821690556002820180549091169055600060038201819055610ad56004830182610b52565b610ae3600583016000610b8e565b6006820180546001600160a01b03191681556000600784018190556008840181905560098401819055610b19600a850182610baf565b610b27600583016000610baf565b610b35600683016000610bcd565b610b43600783016000610b52565b505050600e01610a92565b5090565b508054610b5e90611582565b6000825580601f10610b705750610a8f565b601f016020900490600052602060002090810190610a8f9190610beb565b5080546000825560050290600052602060002090810190610a8f9190610c00565b5080546000825590600052602060002090810190610a8f9190610beb565b5080546000825590600052602060002090810190610a8f9190610c3f565b5b80821115610b4e5760008155600101610bec565b80821115610b4e57600080825560018201805462ffffff191690556002820181905560038201819055610c366004830182610b52565b50600501610c00565b80821115610b4e576000610c538282610baf565b50600101610c3f565b60008083601f840112610c6d578182fd5b50813567ffffffffffffffff811115610c84578182fd5b6020830191508360208083028501011115610c9e57600080fd5b9250929050565b600060208284031215610cb6578081fd5b8151610cc181611aea565b9392505050565b600060208284031215610cd9578081fd5b8151610cc181611aff565b600080600060408486031215610cf8578182fd5b83359250602084013567ffffffffffffffff811115610d15578283fd5b610d2186828701610c5c565b9497909650939450505050565b60008060408385031215610d40578182fd5b50508035926020909101359150565b60008060008060608587031215610d64578081fd5b843593506020850135610d7681611aea565b9250604085013567ffffffffffffffff811115610d91578182fd5b610d9d87828801610c5c565b95989497509550505050565b6001600160a01b03169052565b6000815480845260208085018081965082840281019150858552828520855b85811015610dfe578284038952610dec8483610eb7565b98850198935060019182019101610dd5565b5091979650505050505050565b6000815480845260208085018081965082840281019150858552828520855b85811015610dfe57828403895260e082548552600183015460ff610e52888801828416610ef4565b610e6460408801828460081c16610ef4565b610e7660608801828460101c166110a2565b505060028301546080860152600383015460a08601528060c0860152610ea181860160048501610efa565b9986019994505060059190910190600101610e2a565b6000815480845260208085019450838352808320835b83811015610ee957815487529582019560019182019101610ecd565b509495945050505050565b15159052565b60008154610f0781611582565b808552602060018381168015610f245760018114610f3857610f66565b60ff19851688840152604088019550610f66565b866000528260002060005b85811015610f5e5781548a8201860152908301908401610f43565b890184019650505b505050505092915050565b6000610100610f8984610f848554611428565b610da9565b600183015460208501526002830154604085015260038301546060850152806080850152610fbc81850160048501610eb7565b905083810360a0850152610fd38160058501610eb7565b905083810360c0850152610fea8160068501610db6565b905083810360e08501526110018160078501610efa565b949350505050565b600061101f836001600160a01b03845416610da9565b61102c6001830154611428565b6110396020850182610da9565b506110476002830154611428565b6110546040850182610da9565b506003820154606084015260e0608084015261107660e0840160048401610efa565b83810360a085015261108b8160058501610e0b565b905083810360c08501526110018160068501610f71565b60ff169052565b6001600160a01b0391909116815260200190565b60006001600160a01b0385168252836020830152606060408301526110e56060830184611009565b95945050505050565b90815260200190565b9182526001600160a01b0316602082015260400190565b60208082526019908201527f536f6c7574696f6e20616c726561647920657865637574656400000000000000604082015260600190565b60208082526010908201527f57726f6e672070726f706f73616c496400000000000000000000000000000000604082015260600190565b60208082526024908201527f536f6c7574696f6e734875623a3a5468697320494420616c726561647920657860408201527f6973747300000000000000000000000000000000000000000000000000000000606082015260800190565b60208082526024908201527f50726f706f73616c206973206e6f742076616c69642061742070726f706f736160408201527f6c48756200000000000000000000000000000000000000000000000000000000606082015260800190565b60208082526017908201527f4e6f7420636f72726563742070726f706f73616c487562000000000000000000604082015260600190565b60208082526018908201527f536f6c7574696f6e734875623a206f6e6c794b65657065720000000000000000604082015260600190565b600060208252610cc16020830184611009565b6000808335601e198436030181126112cd578283fd5b83018035915067ffffffffffffffff8211156112e7578283fd5b6020908101925081023603821315610c9e57600080fd5b6000808335601e19843603018112611314578182fd5b83018035915067ffffffffffffffff82111561132e578283fd5b602001915036819003821315610c9e57600080fd5b6000823560fe19833603018112611358578182fd5b9190910192915050565b6000823560de19833603018112611358578182fd5b60009081526020902090565b6020841080156113d957601f8411600181146113aa576113a386856115bd565b83556113d3565b6113b383611377565b6113c86020601f880104820160018301611434565b506113d386846116a9565b50610855565b8160005260206000206020601f8701048101601f871680156114035761140381600019840161162d565b506114166020601f880104830182611434565b50506001856002021782555050505050565b6001600160a01b031690565b5b818110156114495760008155600101611435565b5050565b6114578382611666565b818160005260208060002060005b8681101561148157833582559282019260019182019101611465565b50505050505050565b67ffffffffffffffff8311156114a2576114a2611617565b6114ac8154611582565b600080601f8611601f8411818117156114cb576114c886611377565b92505b80156114fa576020601f890104830160208910156114e65750825b6114f86020601f880104850182611434565b505b50806001811461152657600094508715611515578387013594505b61151f88866115bd565b8655611578565b601f198816945082845b868110156115505788860135825560209586019560019092019101611530565b508886101561156d57878501356000196008601f8c16021c191681555b506001600289020186555b5050505050505050565b60028104600182168061159657607f821691505b602082108114156115b757634e487b7160e01b600052602260045260246000fd5b50919050565b600019600883021c191660029091021790565b60006000198214156115e4576115e4611601565b5060010190565b634e487b7160e01b600052600060045260246000fd5b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b8054600019836020036008021c1681555050565b6000813561164e81611aff565b92915050565b6000813560ff8116811461164e578182fd5b6801000000000000000082111561167f5761167f611617565b805482825580831015610a69578160005260206000206116a3828201858301611434565b50505050565b8060005260206000206116bd8382546115bd565b9091556000905550565b6001600160a01b0382166001600160a01b03198254161781555050565b81356116ef81611aea565b6116f981836116c7565b50600160208084013582840155604084013560028401556060840135600384015561172760808501856112b7565b61173581836004880161144d565b505061174460a08501856112b7565b61175281836005880161144d565b50506006830161176560c08601866112b7565b6801000000000000000081111561177e5761177e611617565b8254818455808210156117b95760008481528581208381019083015b808210156117b5576117ac8383611666565b9088019061179a565b5050505b50816117c484611377565b93506000805b838110156117f9576117dc83866112b7565b6117e88183868b611a22565b5050948701949186019187016117ca565b505050505050505061180e60e08301836112fe565b6116a381836007860161148a565b813561182781611aea565b61183181836116c7565b50600160208084013561184381611aea565b61184f818486016116c7565b506002604085013561186081611aea565b61186c818387016116c7565b506003606086013581860155600461188760808801886112fe565b6118948183858b0161148a565b505060058087016118a860a08a018a6112b7565b680100000000000000008111156118c1576118c1611617565b825481845580821015611989577f33333333333333333333333333333333333333333333333333333333333333338082118b161561190157611901611601565b8083118b161561191357611913611601565b506000848152898120838702810190878402015b808210156119855761193a838484611acb565b828d83015561194c83848d8501611acb565b61195983848c8501611acb565b888201805461196781611582565b80156119795761197986828486611383565b50505090870190611927565b5050505b5081965061199683611377565b9550600094508492505b808310156119cd576119bc6119b58884611362565b8688611a3b565b9587019594830194918801916119a0565b5050505050505050506114496119e660c0840184611343565b600683016116e4565b805461ff00191691151560081b61ff0016919091179055565b805462ff00008360101b1662ff0000198216178255505050565b8115611a3057611a306115eb565b6116a384848361144d565b8115611a4957611a496115eb565b82358155600181016020840135611a5f81611aff565b815490151560ff1660ff1991909116178155611a86611a8060408601611641565b826119ef565b611a9b611a9560608601611654565b82611a08565b506080830135600282015560a08301356003820155611abd60c08401846112fe565b61085581836004860161148a565b805460088302600019811b8086831b1681198416178455505050505050565b6001600160a01b0381168114610a8f57600080fd5b8015158114610a8f57600080fdfea26469706673582212201b09edcb35ae0ba5b98af060825c7b8c4375f758c4e836a849cf7b35e7b9eb6e64736f6c63430008000033";

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
