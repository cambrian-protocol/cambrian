/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { SolverLib, SolverLibInterface } from "../SolverLib";

const _abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "collateralToken",
            type: "IERC20",
          },
          {
            internalType: "bytes32",
            name: "questionId",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "parentCollectionId",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "conditionId",
            type: "bytes32",
          },
          {
            internalType: "uint256[]",
            name: "payouts",
            type: "uint256[]",
          },
          {
            internalType: "enum SolverLib.Status",
            name: "status",
            type: "SolverLib.Status",
          },
        ],
        internalType: "struct SolverLib.Condition",
        name: "condition",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "partition",
        type: "uint256",
      },
    ],
    name: "getCollectionId",
    outputs: [
      {
        internalType: "bytes32",
        name: "collectionId",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "collateralToken",
            type: "IERC20",
          },
          {
            internalType: "bytes32",
            name: "questionId",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "parentCollectionId",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "conditionId",
            type: "bytes32",
          },
          {
            internalType: "uint256[]",
            name: "payouts",
            type: "uint256[]",
          },
          {
            internalType: "enum SolverLib.Status",
            name: "status",
            type: "SolverLib.Status",
          },
        ],
        internalType: "struct SolverLib.Condition",
        name: "condition",
        type: "tuple",
      },
      {
        internalType: "contract IERC20",
        name: "collateralToken",
        type: "IERC20",
      },
      {
        internalType: "uint256",
        name: "partition",
        type: "uint256",
      },
    ],
    name: "getPositionId",
    outputs: [
      {
        internalType: "uint256",
        name: "positionId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
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
            type: "SolverLib.IngestType",
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
        internalType: "uint256",
        name: "conditionVer",
        type: "uint256",
      },
    ],
    name: "ingestsValid",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "scale",
        type: "uint128",
      },
    ],
    name: "mulScale",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x61257061003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106101255760003560e01c80635cc1f6b5116100bc578063b1adb6f61161008b578063b89c10e711610070578063b89c10e714610310578063ddc2f15514610330578063ec7ac2f01461034357610125565b8063b1adb6f6146102d0578063b3d73707146102e357610125565b80635cc1f6b514610250578063696d4661146102705780636a0a24f114610290578063764d6736146102b057610125565b806348cc49d5116100f857806348cc49d5146101ac5780634dd0aa49146101cc5780635069a07c1461020357806359111fb51461023057610125565b806311ca1ac01461012a5780631e85323f1461014c57806324b286021461016c578063366968281461018c575b600080fd5b81801561013657600080fd5b5061014a610145366004611a97565b610363565b005b81801561015857600080fd5b5061014a61016736600461167e565b610381565b81801561017857600080fd5b5061014a610187366004611a35565b6104c9565b81801561019857600080fd5b5061014a6101a7366004611915565b6104e3565b8180156101b857600080fd5b5061014a6101c7366004611a97565b610a5e565b8180156101d857600080fd5b506101ec6101e7366004611adc565b610ad1565b6040516101fa929190611f9a565b60405180910390f35b81801561020f57600080fd5b5061022361021e3660046118ad565b610b76565b6040516101fa91906121d7565b81801561023c57600080fd5b5061014a61024b366004611a35565b610de0565b61026361025e36600461180f565b610df6565b6040516101fa91906120bd565b81801561027c57600080fd5b5061014a61028b366004611a35565b610e64565b81801561029c57600080fd5b5061014a6102ab366004611a4d565b610e7f565b6102c36102be36600461199a565b610ea2565b6040516101fa91906120c8565b6102c36102de3660046119f2565b610fb9565b8180156102ef57600080fd5b506103036102fe366004611a35565b61104e565b6040516101fa919061214b565b81801561031c57600080fd5b5061014a61032b366004611a35565b611267565b6102c361033e366004611b27565b6112db565b81801561034f57600080fd5b5061014a61035e366004611a35565b6113b2565b6005828101805460ff1916909117905561037d8282610a5e565b5050565b6001600160a01b0384166104315761039c6020840184611891565b6001600160a01b031663095ea7b3735fbdb2315678afecb367f032d93f642f64180aa3836040518363ffffffff1660e01b81526004016103dd929190611fb4565b602060405180830381600087803b1580156103f757600080fd5b505af115801561040b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061042f9190611859565b505b735fbdb2315678afecb367f032d93f642f64180aa36372ce42756104586020860186611891565b6040850135606086013561046f6080890189612265565b876040518763ffffffff1660e01b81526004016104919695949392919061215e565b600060405180830381600087803b1580156104ab57600080fd5b505af11580156104bf573d6000803e3d6000fd5b5050505050505050565b6005810180546003919060ff19166001835b021790555050565b60006104f26080860186612265565b905067ffffffffffffffff81111561051a57634e487b7160e01b600052604160045260246000fd5b604051908082528060200260200182016040528015610543578160200160208202803683370190505b509050600061055560a0870187612265565b905067ffffffffffffffff81111561057d57634e487b7160e01b600052604160045260246000fd5b6040519080825280602002602001820160405280156105b057816020015b606081526020019060019003908161059b5790505b50905060005b6105c36080880188612265565b90508110156106595761061c6105d889612460565b6105e560208a018a611891565b6105f260808b018b612265565b8581811061061057634e487b7160e01b600052603260045260246000fd5b90506020020135610ea2565b83828151811061063c57634e487b7160e01b600052603260045260246000fd5b602090810291909101015280610651816124a7565b9150506105b6565b5060005b61066a60a0880188612265565b905081101561089c576106806080880188612265565b905067ffffffffffffffff8111156106a857634e487b7160e01b600052604160045260246000fd5b6040519080825280602002602001820160405280156106d1578160200160208202803683370190505b508282815181106106f257634e487b7160e01b600052603260045260246000fd5b602002602001018190525060005b61070d6080890189612265565b90508110156108895785600061072660c08b018b612265565b8481811061074457634e487b7160e01b600052603260045260246000fd5b90506020028101906107569190612265565b8581811061077457634e487b7160e01b600052603260045260246000fd5b905060200201358152602001908152602001600020805461079490612472565b80601f01602080910402602001604051908101604052809291908181526020018280546107c090612472565b801561080d5780601f106107e25761010080835404028352916020019161080d565b820191906000526020600020905b8154815290600101906020018083116107f057829003601f168201915b50505050508060200190518101906108259190611879565b83838151811061084557634e487b7160e01b600052603260045260246000fd5b6020026020010151828151811061086c57634e487b7160e01b600052603260045260246000fd5b602090810291909101015280610881816124a7565b915050610700565b5080610894816124a7565b91505061065d565b5060005b6108ad60a0880188612265565b90508110156104bf57735fbdb2315678afecb367f032d93f642f64180aa3632eb2c2d6878760006108e160a08d018d612265565b878181106108ff57634e487b7160e01b600052603260045260246000fd5b905060200201358152602001908152602001600020805461091f90612472565b80601f016020809104026020016040519081016040528092919081815260200182805461094b90612472565b80156109985780601f1061096d57610100808354040283529160200191610998565b820191906000526020600020905b81548152906001019060200180831161097b57829003601f168201915b50505050508060200190518101906109b09190611662565b868686815181106109d157634e487b7160e01b600052603260045260246000fd5b6020026020010151896040516020016109ea91906120c8565b6040516020818303038152906040526040518663ffffffff1660e01b8152600401610a19959493929190611f27565b600060405180830381600087803b158015610a3357600080fd5b505af1158015610a47573d6000803e3d6000fd5b505050508080610a56906124a7565b9150506108a0565b6001820154604051633124a62b60e21b8152735fbdb2315678afecb367f032d93f642f64180aa39163c49298ac91610a9b919085906004016120d1565b600060405180830381600087803b158015610ab557600080fd5b505af1158015610ac9573d6000803e3d6000fd5b505050505050565b60008073e7f1725e7734ce288f8367e1bb143e90bb3f051263c31031d585610afa866001612415565b886040518463ffffffff1660e01b8152600401610b1993929190611fcd565b602060405180830381600087803b158015610b3357600080fd5b505af1158015610b47573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b6b9190611662565b958695509350505050565b610b7e6113c8565b610b8b60e08601866122ac565b8484604051602001610ba09493929190611ef4565b60408051601f198184030181529190528051602091820120908201526001600160a01b038416610bd65760006040820152610c85565b610c7f846001600160a01b0316637c1236276040518163ffffffff1660e01b815260040160006040518083038186803b158015610c1257600080fd5b505afa158015610c26573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610c4e91908101906116f9565b8381518110610c6d57634e487b7160e01b600052603260045260246000fd5b60200260200101518660400135610fb9565b60408201525b6020808201516040517f852c6ae2000000000000000000000000000000000000000000000000000000008152735fbdb2315678afecb367f032d93f642f64180aa39263852c6ae292610cdf9288928b013590600401611f79565b60206040518083038186803b158015610cf757600080fd5b505afa158015610d0b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d2f9190611879565b6060820152610d416020860186611891565b6001600160a01b031681526020808201516040517fd96ee754000000000000000000000000000000000000000000000000000000008152735fbdb2315678afecb367f032d93f642f64180aa39263d96ee75492610da69288928b013590600401611f79565b600060405180830381600087803b158015610dc057600080fd5b505af1158015610dd4573d6000803e3d6000fd5b50505050949350505050565b6005810180546002919060ff19166001836104db565b6000805b83811015610e575782858583818110610e2357634e487b7160e01b600052603260045260246000fd5b9050602002810190610e3591906122f1565b3514610e45576000915050610e5d565b80610e4f816124a7565b915050610dfa565b50600190505b9392505050565b60058101805460ff19166006179055610e7c81611267565b50565b60058301805460ff19166002179055610e9c6004840183836113fa565b50505050565b6040808401516060850151915163856296f760e01b8152600092735fbdb2315678afecb367f032d93f642f64180aa39283926339dd7530928892859263856296f792610ef392918b90600401612135565b60206040518083038186803b158015610f0b57600080fd5b505afa158015610f1f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f439190611879565b6040518363ffffffff1660e01b8152600401610f60929190611fb4565b60206040518083038186803b158015610f7857600080fd5b505afa158015610f8c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fb09190611879565b95945050505050565b6040808301516060840151915163856296f760e01b8152600092735fbdb2315678afecb367f032d93f642f64180aa39263856296f792610ffe92908790600401612135565b60206040518083038186803b15801561101657600080fd5b505afa15801561102a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e5d9190611879565b805460609082600061105f836124a7565b909155505060018281015460ff16600281111561108c57634e487b7160e01b600052602160045260246000fd5b146111d25760038201546040517f3837b05e0000000000000000000000000000000000000000000000000000000081526000913091633837b05e916110d3916004016120c8565b60206040518083038186803b1580156110eb57600080fd5b505afa1580156110ff573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111239190611662565b9050600080826001600160a01b0316856004016040516111439190611e59565b600060405180830381855afa9150503d806000811461117e576040519150601f19603f3d011682016040523d82523d6000602084013e611183565b606091505b5091509150816111c8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016111bf906121a0565b60405180910390fd5b9250611262915050565b8160040180546111e190612472565b80601f016020809104026020016040519081016040528092919081815260200182805461120d90612472565b801561125a5780601f1061122f5761010080835404028352916020019161125a565b820191906000526020600020905b81548152906001019060200180831161123d57829003601f168201915b505050505090505b919050565b6001810154604051633124a62b60e21b8152735fbdb2315678afecb367f032d93f642f64180aa39163c49298ac916112a69190600480870191016120f2565b600060405180830381600087803b1580156112c057600080fd5b505af11580156112d4573d6000803e3d6000fd5b5050505050565b6000806112f16001600160801b0384168661242d565b905060006113086001600160801b038516876124c2565b9050600061131f6001600160801b0386168761242d565b905060006113366001600160801b038716886124c2565b90506001600160801b03861661134c8285612441565b611356919061242d565b6113608385612441565b61136a8387612441565b6001600160801b03891661137e8689612441565b6113889190612441565b6113929190612415565b61139c9190612415565b6113a69190612415565b98975050505050505050565b6005810180546004919060ff19166001836104db565b6040805160c081018252600080825260208201819052918101829052606080820183905260808201529060a082015290565b828054828255906000526020600020908101928215611435579160200282015b8281111561143557823582559160200191906001019061141a565b50611441929150611445565b5090565b5b808211156114415760008155600101611446565b803561126281612518565b60008083601f840112611476578182fd5b50813567ffffffffffffffff81111561148d578182fd5b60208301915083602080830285010111156114a757600080fd5b9250929050565b600082601f8301126114be578081fd5b813560206114d36114ce8361233a565b612310565b82815281810190858301838502870184018810156114ef578586fd5b855b8581101561150d578135845292840192908401906001016114f1565b5090979650505050505050565b600082601f83011261152a578081fd5b8151602061153a6114ce8361233a565b8281528181019085830183850287018401881015611556578586fd5b855b8581101561150d57815184529284019290840190600101611558565b805161126281612518565b80356112628161252d565b80516112628161252d565b600061010082840312156115a7578081fd5b50919050565b600060c082840312156115a7578081fd5b600060c082840312156115cf578081fd5b60405160c0810167ffffffffffffffff82821081831117156115f3576115f3612502565b816040528293506116038561145a565b8352602085013560208401526040850135604084015260608501356060840152608085013591508082111561163757600080fd5b50611644858286016114ae565b60808301525061165660a0840161157f565b60a08201525092915050565b600060208284031215611673578081fd5b8151610e5d81612518565b60008060008060808587031215611693578283fd5b843561169e81612518565b9350602085013567ffffffffffffffff808211156116ba578485fd5b6116c688838901611595565b945060408701359150808211156116db578384fd5b506116e8878288016115ad565b949793965093946060013593505050565b6000602080838503121561170b578182fd5b825167ffffffffffffffff80821115611722578384fd5b818501915085601f830112611735578384fd5b81516117436114ce8261233a565b81815284810190848601875b84811015611800578151870160c080601f19838f0301121561176f578a8bfd5b604080518281018181108b8211171561178a5761178a612502565b8252611797848d01611574565b8152818401518c820152606080850151838301526080850151818301525060a08401519150898211156117c8578c8dfd5b6117d68f8d8487010161151a565b60808201526117e683850161158a565b60a08201528752505050928701929087019060010161174f565b50909998505050505050505050565b600080600060408486031215611823578081fd5b833567ffffffffffffffff811115611839578182fd5b61184586828701611465565b909790965060209590950135949350505050565b60006020828403121561186a578081fd5b81518015158114610e5d578182fd5b60006020828403121561188a578081fd5b5051919050565b6000602082840312156118a2578081fd5b8135610e5d81612518565b600080600080608085870312156118c2578182fd5b843567ffffffffffffffff8111156118d8578283fd5b6118e487828801611595565b94505060208501356118f581612518565b9250604085013561190581612518565b9396929550929360600135925050565b600080600080600060a0868803121561192c578283fd5b853567ffffffffffffffff80821115611943578485fd5b61194f89838a016115ad565b96506020880135915080821115611964578485fd5b5061197188828901611595565b945050604086013561198281612518565b94979396509394606081013594506080013592915050565b6000806000606084860312156119ae578081fd5b833567ffffffffffffffff8111156119c4578182fd5b6119d0868287016115be565b93505060208401356119e181612518565b929592945050506040919091013590565b60008060408385031215611a04578182fd5b823567ffffffffffffffff811115611a1a578283fd5b611a26858286016115be565b95602094909401359450505050565b600060208284031215611a46578081fd5b5035919050565b600080600060408486031215611a61578081fd5b83359250602084013567ffffffffffffffff811115611a7e578182fd5b611a8a86828701611465565b9497909650939450505050565b60008060408385031215611aa9578182fd5b82359150602083013567ffffffffffffffff811115611ac6578182fd5b611ad2858286016114ae565b9150509250929050565b600080600060608486031215611af0578081fd5b833567ffffffffffffffff811115611b06578182fd5b840160e08187031215611b17578182fd5b925060208401356119e181612518565b600080600060608486031215611b3b578081fd5b833592506020840135915060408401356001600160801b0381168114611b5f578182fd5b809150509250925092565b6001600160a01b03169052565b818352602080840193600091908185020181018584845b87811015611bc4578284038952611ba5828861236a565b611bb0868284611c70565b9a87019a9550505090840190600101611b8e565b5091979650505050505050565b818352602080840193600091908185020181018584845b87811015611bc45782840389528135609e19883603018112611c08578687fd5b87018035855260a08682013560038110611c20578889fd5b8688015260408281013590870152606080830135908701526080611c46818401846123b2565b93508282890152611c5a8389018583611cf7565b9c89019c97505050928601925050600101611be8565b60008284527f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff831115611ca1578081fd5b6020830280836020870137939093016020019283525090919050565b6000815180845260208085019450808401835b83811015611cec57815187529582019590820190600101611cd0565b509495945050505050565b60008284528282602086013780602084860101526020601f19601f85011685010190509392505050565b60008151808452815b81811015611d4657602081850181015186830182015201611d2a565b81811115611d575782602083870101525b50601f01601f19169290920160200192915050565b60078110611d8a57634e487b7160e01b600052602160045260246000fd5b9052565b6000610100611da584611da08561145a565b611b6a565b602083013560208501526040830135604085015260608301356060850152611dd0608084018461236a565b826080870152611de38387018284611c70565b92505050611df460a084018461236a565b85830360a0870152611e07838284611c70565b92505050611e1860c084018461236a565b85830360c0870152611e2b838284611b77565b92505050611e3c60e08401846123b2565b85830360e0870152611e4f838284611cf7565b9695505050505050565b8154600090819060028104600180831680611e7557607f831692505b6020808410821415611e9557634e487b7160e01b87526022600452602487fd5b818015611ea95760018114611eba57611ee6565b60ff19861689528489019650611ee6565b611ec38a61235e565b885b86811015611ede5781548b820152908501908301611ec5565b505084890196505b509498975050505050505050565b6000848683375060609290921b6bffffffffffffffffffffffff1916919092019081526014810191909152603401919050565b60006001600160a01b03808816835280871660208401525060a06040830152611f5360a0830186611cbd565b8281036060840152611f658186611cbd565b905082810360808401526113a68185611d21565b6001600160a01b039390931683526020830191909152604082015260600190565b6001600160a01b0392831681529116602082015260400190565b6001600160a01b03929092168252602082015260400190565b60006001600160a01b0385168252836020830152606060408301528235611ff381612518565b6120006060840182611b6a565b5061200d6020840161145a565b61201a6080840182611b6a565b506120276040840161145a565b61203460a0840182611b6a565b50606083013560c083015261204c60808401846123b2565b60e08085015261206161014085018284611cf7565b91505061207160a085018561236a565b605f19808685030161010087015261208a848385611bd1565b935061209960c08801886123f7565b9250808685030161012087015250506120b28282611d8e565b979650505050505050565b901515815260200190565b90815260200190565b6000838252604060208301526120ea6040830184611cbd565b949350505050565b60006040820184835260206040818501528185548084526060860191508685528285209350845b8181101561150d57845483526001948501949284019201612119565b9283526020830191909152604082015260600190565b600060208252610e5d6020830184611d21565b60006001600160a01b038816825286602083015285604083015260a0606083015261218d60a083018587611c70565b9050826080830152979650505050505050565b60208082526018908201527f496e676573742073746174696363616c6c206661696c65640000000000000000604082015260600190565b6000602080835260e083016001600160a01b03855116828501528185015160408501526040850151606085015260608501516080850152608085015160c060a08601528181518084526101008701915084830193508592505b808310156122505783518252928401926001929092019190840190612230565b5060a08701519350611e4f60c0870185611d6c565b6000808335601e1984360301811261227b578283fd5b83018035915067ffffffffffffffff821115612295578283fd5b60209081019250810236038213156114a757600080fd5b6000808335601e198436030181126122c2578283fd5b83018035915067ffffffffffffffff8211156122dc578283fd5b6020019150368190038213156114a757600080fd5b60008235609e19833603018112612306578182fd5b9190910192915050565b60405181810167ffffffffffffffff8111828210171561233257612332612502565b604052919050565b600067ffffffffffffffff82111561235457612354612502565b5060209081020190565b60009081526020902090565b6000808335601e19843603018112612380578283fd5b830160208101925035905067ffffffffffffffff8111156123a057600080fd5b6020810236038313156114a757600080fd5b6000808335601e198436030181126123c8578283fd5b830160208101925035905067ffffffffffffffff8111156123e857600080fd5b8036038313156114a757600080fd5b6000823560fe1983360301811261240c578182fd5b90910192915050565b60008219821115612428576124286124d6565b500190565b60008261243c5761243c6124ec565b500490565b600081600019048311821515161561245b5761245b6124d6565b500290565b600061246c36836115be565b92915050565b60028104600182168061248657607f821691505b602082108114156115a757634e487b7160e01b600052602260045260246000fd5b60006000198214156124bb576124bb6124d6565b5060010190565b6000826124d1576124d16124ec565b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114610e7c57600080fd5b60078110610e7c57600080fdfea2646970667358221220618dd3fc61058d2e8eebf0c80d7cf53b0d5857ae02baccb8c857d2a9dfac124d64736f6c63430008000033";

export class SolverLib__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<SolverLib> {
    return super.deploy(overrides || {}) as Promise<SolverLib>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): SolverLib {
    return super.attach(address) as SolverLib;
  }
  connect(signer: Signer): SolverLib__factory {
    return super.connect(signer) as SolverLib__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SolverLibInterface {
    return new utils.Interface(_abi) as SolverLibInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SolverLib {
    return new Contract(address, _abi, signerOrProvider) as SolverLib;
  }
}
