/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  SolverCloneFactory,
  SolverCloneFactoryInterface,
} from "../SolverCloneFactory";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
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
        internalType: "contract ConditionalTokens",
        name: "_conditionalTokens",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_solutionId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_proposalsHub",
        type: "address",
      },
      {
        internalType: "address",
        name: "_solutionsHub",
        type: "address",
      },
      {
        internalType: "address",
        name: "_keeper",
        type: "address",
      },
      {
        internalType: "address",
        name: "_arbitrator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_timelockHours",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "bool",
            name: "executed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useSolverIdx",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "solverIdx",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct Minion.Action[]",
        name: "_actions",
        type: "tuple[]",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
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
    inputs: [],
    name: "implementationAddress",
    outputs: [
      {
        internalType: "address",
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
  "0x60a060405234801561001057600080fd5b5060405161001d9061004f565b604051809103906000f080158015610039573d6000803e3d6000fd5b5060601b6001600160601b03191660805261005c565b612a218061087c83390190565b60805160601c6107fc6100806000396000818160bc01526101e401526107fc6000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806392ce765e14610046578063b942ca6e1461006f578063b97a231914610082575b600080fd5b6100596100543660046105a9565b61008a565b604051610066919061060c565b60405180910390f35b61005961007d3660046104dd565b6100b4565b6100596101e2565b6000818154811061009a57600080fd5b6000918252602090912001546001600160a01b0316905081565b6000806100e07f0000000000000000000000000000000000000000000000000000000000000000610206565b6040517f16b924100000000000000000000000000000000000000000000000000000000081529091506001600160a01b038216906316b9241090610138908e908e908e908e908e908e908e908e908e90600401610620565b600060405180830381600087803b15801561015257600080fd5b505af1158015610166573d6000803e3d6000fd5b5050600080546001810182559080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5630180547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b038516179055506101d49050816102b4565b9a9950505050505050505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b60006040517f3d602d80600a3d3981f3363d3d373d3d3d363d7300000000000000000000000081528260601b60148201527f5af43d82803e903d91602b57fd5bf3000000000000000000000000000000000060288201526037816000f09150506001600160a01b0381166102af576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102a690610721565b60405180910390fd5b919050565b610325816040516024016102c8919061060c565b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167f2c2ecbc200000000000000000000000000000000000000000000000000000000179052610328565b50565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b80356102af816107b1565b600082601f830112610364578081fd5b8135602067ffffffffffffffff8083111561038157610381610782565b61038e8283850201610758565b83815282810190868401865b86811015610454578135890160c080601f19838e030112156103ba57898afd5b604080518281018181108a821117156103d5576103d5610782565b82526103e2848b01610349565b81526103ef828501610462565b8a8201526060610400818601610462565b838301526080925082850135818301525060a080850135838301528385013593508984111561042d578c8dfd5b61043b8f8c86880101610472565b908201528752505050928501929085019060010161039a565b509098975050505050505050565b803580151581146102af57600080fd5b600082601f830112610482578081fd5b813567ffffffffffffffff81111561049c5761049c610782565b6104af601f8201601f1916602001610758565b8181528460208386010111156104c3578283fd5b816020850160208301379081016020019190915292915050565b60008060008060008060008060006101208a8c0312156104fb578485fd5b8935610506816107b1565b985060208a0135975060408a013561051d816107b1565b965061052b60608b01610349565b955061053960808b01610349565b945061054760a08b01610349565b935060c08a0135925060e08a013567ffffffffffffffff8082111561056a578384fd5b6105768d838e01610354565b93506101008c013591508082111561058c578283fd5b506105998c828d01610472565b9150509295985092959850929598565b6000602082840312156105ba578081fd5b5035919050565b60008151808452815b818110156105e6576020818501810151868301820152016105ca565b818111156105f75782602083870101525b50601f01601f19169290920160200192915050565b6001600160a01b0391909116815260200190565b60006101208083016001600160a01b03808e16855260208d818701526040828e16818801526060838e16818901526080848e16818a015260a0858e16818b015260c08d818c01528860e08c01528798508c518089526101409850888c019950888782028d01019850868e018b5b828110156106f3578d8b0361013f19018c52815180518b168c528981015115158a8d0152888101511515898d015287810151888d015286810151878d0152850151858c018590526106e0858d01826105c1565b9c8a019c9b50509088019060010161068d565b5050505050505050505083810361010085015261071081866105c1565b9d9c50505050505050505050505050565b60208082526016908201527f455243313136373a20637265617465206661696c656400000000000000000000604082015260600190565b60405181810167ffffffffffffffff8111828210171561077a5761077a610782565b604052919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6001600160a01b038116811461032557600080fdfea26469706673582212208a01e91f4b4dbb7a204a764fafbea5bc74eaf01240255aacda1173fbbbb1d52964736f6c63430008000033608060405234801561001057600080fd5b50612a01806100206000396000f3fe608060405234801561001057600080fd5b50600436106101a35760003560e01c806383240f83116100ee578063bc197c8111610097578063e7fd205911610071578063e7fd205914610305578063efabae5714610318578063f23a6e6114610320578063fe25e00a14610333576101a3565b8063bc197c81146102d5578063c43c168e146102f5578063d33219b4146102fd576101a3565b8063a2b14e6f116100c8578063a2b14e6f146102bd578063a7f5d48c146102c5578063aced1661146102cd576101a3565b806383240f831461027557806383d012f41461029a5780638d905df5146102a2576101a3565b80635bd9e299116101505780636f2f3e771161012a5780636f2f3e771461025057806373d4a13a14610258578063799320bb1461026d576101a3565b80635bd9e2991461021357806363fa8ee4146102285780636bf90c841461023b576101a3565b806331a38c891161018157806331a38c89146101ee5780633a275fa21461020357806348d6bc001461020b576101a3565b80630d49722d146101a857806316b92410146101bd5780632bbca157146101d0575b600080fd5b6101bb6101b6366004611efd565b61033b565b005b6101bb6101cb366004611f71565b610448565b6101d8610644565b6040516101e591906122c4565b60405180910390f35b6101f661064a565b6040516101e591906122b9565b6101bb61065a565b6101bb6106bc565b61021b61087c565b6040516101e59190612181565b6101bb61023636600461203d565b610891565b610243610da8565b6040516101e59190612275565b6101bb610e00565b610260610e63565b6040516101e5919061236e565b6101f6610ef1565b610288610283366004612111565b610f01565b6040516101e5969594939291906121f1565b6101f6610fe3565b6102aa610ff3565b6040516101e59796959493929190612381565b61021b61101b565b61021b61102a565b61021b611039565b6102e86102e3366004611dc8565b611048565b6040516101e59190612341565b6101d86110de565b6101d86110e4565b6101bb610313366004611efd565b6110ea565b6101f66111b3565b6102e861032e366004611e83565b6111c3565b61021b611257565b6004546001600160a01b031633148061035e57506005546001600160a01b031633145b6103835760405162461bcd60e51b815260040161037a90612763565b60405180910390fd5b600054600160b81b900460ff1615156001146103b15760405162461bcd60e51b815260040161037a90612502565b600054600160c01b900460ff16156103db5760405162461bcd60e51b815260040161037a90612539565b600054600160c81b900460ff16156104055760405162461bcd60e51b815260040161037a906124a5565b600054600160b01b900460ff161561042f5760405162461bcd60e51b815260040161037a9061263b565b61043b60088383611a5e565b50610444611266565b5050565b6001600160a01b03851661046e5760405162461bcd60e51b815260040161037a9061246e565b60005b825181101561058457600983828151811061049c57634e487b7160e01b600052603260045260246000fd5b602090810291909101810151825460018181018555600094855293839020825160049092020180548385015160408501511515600160a81b027fffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffffff911515600160a01b0260ff60a01b196001600160a01b0390961673ffffffffffffffffffffffffffffffffffffffff19909416939093179490941691909117169190911781556060820151938101939093556080810151600284015560a0810151805191939261056e92600385019290910190611aa9565b505050808061057c90612961565b915050610471565b50600080547fffffffffffffffffffff0000000000000000000000000000000000000000ffff16620100006001600160a01b038c8116919091029190911790915560018990556002805473ffffffffffffffffffffffffffffffffffffffff199081168a8416179091556003805482168984161790556004805482168884161790556005805490911691861691909117905561062283610e106128dd565b600655805161063890600a906020840190611aa9565b50505050505050505050565b60065481565b600054600160b81b900460ff1681565b6003546001600160a01b031633146106845760405162461bcd60e51b815260040161037a90612672565b600080547fffffffffffffffff00ffffffffffffffffffffffffffffffffffffffffffffff16600160b81b1790556106ba611324565b565b6004546001600160a01b03163314806106df57506005546001600160a01b031633145b6106fb5760405162461bcd60e51b815260040161037a90612763565b600054600160b81b900460ff1615156001146107295760405162461bcd60e51b815260040161037a90612502565b600054600160c01b900460ff16156107535760405162461bcd60e51b815260040161037a90612539565b600054600160c81b900460ff161561077d5760405162461bcd60e51b815260040161037a906124a5565b600054600160b01b900460ff16156107a75760405162461bcd60e51b815260040161037a9061263b565b60075442116107c85760405162461bcd60e51b815260040161037a906127c0565b600054600d546040517fc49298ac000000000000000000000000000000000000000000000000000000008152620100009092046001600160a01b03169163c49298ac9161081a916008906004016122cd565b600060405180830381600087803b15801561083457600080fd5b505af1158015610848573d6000803e3d6000fd5b5050600080547fffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffffffff16600160b01b1790555050565b6000546201000090046001600160a01b031681565b600054600160b81b900460ff1615156001146108bf5760405162461bcd60e51b815260040161037a90612502565b600054600160c01b900460ff16156108e95760405162461bcd60e51b815260040161037a90612539565b600054600160c81b900460ff16156109135760405162461bcd60e51b815260040161037a906124a5565b600054600160b01b900460ff161561093d5760405162461bcd60e51b815260040161037a9061263b565b33301461095c5760405162461bcd60e51b815260040161037a90612706565b60135460ff161561097f5760405162461bcd60e51b815260040161037a90612437565b60138054600160ff199091161790556000546040517fd96ee754000000000000000000000000000000000000000000000000000000008152620100009091046001600160a01b03169063d96ee754906109e09030908e908e9060040161223b565b600060405180830381600087803b1580156109fa57600080fd5b505af1158015610a0e573d6000803e3d6000fd5b5050600080546040517f852c6ae20000000000000000000000000000000000000000000000000000000081529193506201000090046001600160a01b0316915063852c6ae290610a669030908f908f9060040161223b565b60206040518083038186803b158015610a7e57600080fd5b505afa158015610a92573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ab69190611f59565b905088610c08576002546040517f23b872dd0000000000000000000000000000000000000000000000000000000081528d916001600160a01b03808416926323b872dd92610b0c92169030908e90600401612195565b602060405180830381600087803b158015610b2657600080fd5b505af1158015610b3a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b5e9190611f3d565b506000546040517f095ea7b30000000000000000000000000000000000000000000000000000000081526001600160a01b038084169263095ea7b392610bb39262010000909204909116908d9060040161225c565b602060405180830381600087803b158015610bcd57600080fd5b505af1158015610be1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c059190611f3d565b50505b600060029054906101000a90046001600160a01b03166001600160a01b03166372ce42758d8b848b8b8e6040518763ffffffff1660e01b8152600401610c53969594939291906123bf565b600060405180830381600087803b158015610c6d57600080fd5b505af1158015610c81573d6000803e3d6000fd5b505050506040518061010001604052808d6001600160a01b03168152602001306001600160a01b031681526020018c81526020018b81526020018a815260200182815260200189815260200188888080602002602001604051908101604052809392919081815260200183836020028082843760009201919091525050509152508051600b805473ffffffffffffffffffffffffffffffffffffffff199081166001600160a01b03938416178255602080850151600c805490931694169390931790556040830151600d556060830151600e556080830151600f5560a083015160105560c083015160115560e083015180519192610d859260129290910190611b1d565b50905050610d9a8c828b8a8a8a8a8a8a611350565b505050505050505050505050565b60606008805480602002602001604051908101604052809291908181526020018280548015610df657602002820191906000526020600020905b815481526020019060010190808311610de2575b5050505050905090565b6005546001600160a01b03163314610e2a5760405162461bcd60e51b815260040161037a906125a7565b60008054600160c01b7fffffffffffffff00ffffffffffffffffffffffffffffffffffffffffffffffff918216171690556106ba611266565b600a8054610e709061292c565b80601f0160208091040260200160405190810160405280929190818152602001828054610e9c9061292c565b8015610ee95780601f10610ebe57610100808354040283529160200191610ee9565b820191906000526020600020905b815481529060010190602001808311610ecc57829003601f168201915b505050505081565b600054600160b01b900460ff1681565b60098181548110610f1157600080fd5b600091825260209091206004909102018054600182015460028301546003840180546001600160a01b038516965060ff600160a01b8604811696600160a81b90960416949190610f609061292c565b80601f0160208091040260200160405190810160405280929190818152602001828054610f8c9061292c565b8015610fd95780601f10610fae57610100808354040283529160200191610fd9565b820191906000526020600020905b815481529060010190602001808311610fbc57829003601f168201915b5050505050905086565b600054600160c01b900460ff1681565b600b54600c54600d54600e54600f546010546011546001600160a01b03968716969095169487565b6002546001600160a01b031681565b6003546001600160a01b031681565b6004546001600160a01b031681565b6000806000306001600160a01b031660008686604051611069929190612155565b60006040518083038185875af1925050503d80600081146110a6576040519150601f19603f3d011682016040523d82523d6000602084013e6110ab565b606091505b507fbc197c81000000000000000000000000000000000000000000000000000000009d9c50505050505050505050505050565b60015481565b60075481565b6005546001600160a01b031633146111145760405162461bcd60e51b815260040161037a906125a7565b600054600160b81b900460ff1615156001146111425760405162461bcd60e51b815260040161037a90612502565b600054600160c01b900460ff1615156001146111705760405162461bcd60e51b815260040161037a90612570565b61117c60088383611a5e565b50600080547fffffffffffff0000ffffffffffffffffffffffffffffffffffffffffffffffff16600160c81b179055610444611266565b600054600160c81b900460ff1681565b6000806000306001600160a01b0316600086866040516111e4929190612155565b60006040518083038185875af1925050503d8060008114611221576040519150601f19603f3d011682016040523d82523d6000602084013e611226565b606091505b507ff23a6e61000000000000000000000000000000000000000000000000000000009b9a5050505050505050505050565b6005546001600160a01b031681565b600054600160b81b900460ff1615156001146112945760405162461bcd60e51b815260040161037a90612502565b600054600160c01b900460ff16156112be5760405162461bcd60e51b815260040161037a90612539565b600054600160c81b900460ff16156112e85760405162461bcd60e51b815260040161037a906124a5565b600054600160b01b900460ff16156113125760405162461bcd60e51b815260040161037a9061263b565b60065461131f90426128c5565b600755565b60005b60095481101561134d5761133a816116b8565b508061134581612961565b915050611327565b50565b600054600160b81b900460ff16151560011461137e5760405162461bcd60e51b815260040161037a90612502565b600054600160c01b900460ff16156113a85760405162461bcd60e51b815260040161037a90612539565b600054600160c81b900460ff16156113d25760405162461bcd60e51b815260040161037a906124a5565b600054600160b01b900460ff16156113fc5760405162461bcd60e51b815260040161037a9061263b565b60005b8581101561063857600080546201000090046001600160a01b031663856296f78a8c8b8b8781811061144157634e487b7160e01b600052603260045260246000fd5b905060200201356040518463ffffffff1660e01b81526004016114669392919061231d565b60206040518083038186803b15801561147e57600080fd5b505afa158015611492573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114b69190611f59565b600080546040517f39dd75300000000000000000000000000000000000000000000000000000000081529293509091620100009091046001600160a01b0316906339dd75309061150c908f90869060040161225c565b60206040518083038186803b15801561152457600080fd5b505afa158015611538573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061155c9190611f59565b905060005b868110156116a2576000546201000090046001600160a01b031663f242432a308a8a888181106115a157634e487b7160e01b600052603260045260246000fd5b90506020028101906115b39190612854565b858181106115d157634e487b7160e01b600052603260045260246000fd5b90506020020160208101906115e69190611d89565b858a8a8a81811061160757634e487b7160e01b600052603260045260246000fd5b90506020028101906116199190612854565b8781811061163757634e487b7160e01b600052603260045260246000fd5b905060200201356040518563ffffffff1660e01b815260040161165d94939291906121b9565b600060405180830381600087803b15801561167757600080fd5b505af115801561168b573d6000803e3d6000fd5b50505050808061169a90612961565b915050611561565b50505080806116b090612961565b9150506113ff565b6060600982815481106116db57634e487b7160e01b600052603260045260246000fd5b6000918252602090912060049091020154600980546001600160a01b03909216918490811061171a57634e487b7160e01b600052603260045260246000fd5b6000918252602090912060049091020154600160a01b900460ff16156117525760405162461bcd60e51b815260040161037a9061281d565b6009838154811061177357634e487b7160e01b600052603260045260246000fd5b9060005260206000209060040201600201544710156117a45760405162461bcd60e51b815260040161037a90612604565b6000600984815481106117c757634e487b7160e01b600052603260045260246000fd5b60009182526020918290206040805160c081018252600490930290910180546001600160a01b038116845260ff600160a01b82048116151595850195909552600160a81b9004909316151590820152600182015460608201526002820154608082015260038201805491929160a0840191906118429061292c565b80601f016020809104026020016040519081016040528092919081815260200182805461186e9061292c565b80156118bb5780601f10611890576101008083540402835291602001916118bb565b820191906000526020600020905b81548152906001019060200180831161189e57829003601f168201915b505050505081525050905080604001511561197d5760035460015460608301516040517f191481a00000000000000000000000000000000000000000000000000000000081526001600160a01b039093169263191481a092611921929091600401612333565b60206040518083038186803b15801561193957600080fd5b505afa15801561194d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119719190611dac565b6001600160a01b031681525b6001600985815481106119a057634e487b7160e01b600052603260045260246000fd5b6000918252602082206004909102018054921515600160a01b0260ff60a01b19909316929092179091558151608083015160a084015160405184936001600160a01b031692916119ef91612165565b60006040518083038185875af1925050503d8060008114611a2c576040519150601f19603f3d011682016040523d82523d6000602084013e611a31565b606091505b509150915081611a535760405162461bcd60e51b815260040161037a906126cf565b935050505b50919050565b828054828255906000526020600020908101928215611a99579160200282015b82811115611a99578235825591602001919060010190611a7e565b50611aa5929150611b57565b5090565b828054611ab59061292c565b90600052602060002090601f016020900481019282611ad75760008555611a99565b82601f10611af057805160ff1916838001178555611a99565b82800160010185558215611a99579182015b82811115611a99578251825591602001919060010190611b02565b828054828255906000526020600020908101928215611a995791602002820182811115611a99578251825591602001919060010190611b02565b5b80821115611aa55760008155600101611b58565b8035611b77816129a8565b919050565b60008083601f840112611b8d578182fd5b50813567ffffffffffffffff811115611ba4578182fd5b6020830191508360208083028501011115611bbe57600080fd5b9250929050565b600082601f830112611bd5578081fd5b8135602067ffffffffffffffff80831115611bf257611bf2612992565b611bff828385020161289b565b83815282810190868401865b86811015611cc5578135890160c080601f19838e03011215611c2b57898afd5b604080518281018181108a82111715611c4657611c46612992565b8252611c53848b01611b6c565b8152611c60828501611cd3565b8a8201526060611c71818601611cd3565b838301526080925082850135818301525060a0808501358383015283850135935089841115611c9e578c8dfd5b611cac8f8c86880101611d1e565b9082015287525050509285019290850190600101611c0b565b509098975050505050505050565b8035611b77816129bd565b60008083601f840112611cef578182fd5b50813567ffffffffffffffff811115611d06578182fd5b602083019150836020828501011115611bbe57600080fd5b600082601f830112611d2e578081fd5b813567ffffffffffffffff811115611d4857611d48612992565b611d5b601f8201601f191660200161289b565b818152846020838601011115611d6f578283fd5b816020850160208301379081016020019190915292915050565b600060208284031215611d9a578081fd5b8135611da5816129a8565b9392505050565b600060208284031215611dbd578081fd5b8151611da5816129a8565b60008060008060008060008060a0898b031215611de3578384fd5b8835611dee816129a8565b97506020890135611dfe816129a8565b9650604089013567ffffffffffffffff80821115611e1a578586fd5b611e268c838d01611b7c565b909850965060608b0135915080821115611e3e578586fd5b611e4a8c838d01611b7c565b909650945060808b0135915080821115611e62578384fd5b50611e6f8b828c01611cde565b999c989b5096995094979396929594505050565b60008060008060008060a08789031215611e9b578182fd5b8635611ea6816129a8565b95506020870135611eb6816129a8565b94506040870135935060608701359250608087013567ffffffffffffffff811115611edf578283fd5b611eeb89828a01611cde565b979a9699509497509295939492505050565b60008060208385031215611f0f578182fd5b823567ffffffffffffffff811115611f25578283fd5b611f3185828601611b7c565b90969095509350505050565b600060208284031215611f4e578081fd5b8151611da5816129bd565b600060208284031215611f6a578081fd5b5051919050565b60008060008060008060008060006101208a8c031215611f8f578283fd5b8935611f9a816129a8565b985060208a0135975060408a0135611fb1816129a8565b9650611fbf60608b01611b6c565b9550611fcd60808b01611b6c565b9450611fdb60a08b01611b6c565b935060c08a0135925060e08a013567ffffffffffffffff80821115611ffe578283fd5b61200a8d838e01611bc5565b93506101008c0135915080821115612020578283fd5b5061202d8c828d01611d1e565b9150509295985092959850929598565b60008060008060008060008060008060006101008c8e03121561205e578485fd5b6120678c611b6c565b9a5060208c0135995060408c0135985060608c0135975060808c0135965067ffffffffffffffff8060a08e0135111561209e578586fd5b6120ae8e60a08f01358f01611b7c565b909750955060c08d01358110156120c3578283fd5b6120d38e60c08f01358f01611b7c565b909550935060e08d01358110156120e8578283fd5b506120f98d60e08e01358e01611b7c565b81935080925050509295989b509295989b9093969950565b600060208284031215612122578081fd5b5035919050565b600081518084526121418160208601602086016128fc565b601f01601f19169290920160200192915050565b6000828483379101908152919050565b600082516121778184602087016128fc565b9190910192915050565b6001600160a01b0391909116815260200190565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6001600160a01b0394851681529290931660208301526040820152606081019190915260a06080820181905260009082015260c00190565b60006001600160a01b03881682528615156020830152851515604083015284606083015283608083015260c060a083015261222f60c0830184612129565b98975050505050505050565b6001600160a01b039390931683526020830191909152604082015260600190565b6001600160a01b03929092168252602082015260400190565b6020808252825182820181905260009190848201906040850190845b818110156122ad57835183529284019291840191600101612291565b50909695505050505050565b901515815260200190565b90815260200190565b60006040820184835260206040818501528185548084526060860191508685528285209350845b81811015612310578454835260019485019492840192016122f4565b5090979650505050505050565b9283526020830191909152604082015260600190565b918252602082015260400190565b7fffffffff0000000000000000000000000000000000000000000000000000000091909116815260200190565b600060208252611da56020830184612129565b6001600160a01b03978816815295909616602086015260408501939093526060840191909152608083015260a082015260c081019190915260e00190565b60006001600160a01b038816825286602083015285604083015260a060608301528360a08301527f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff841115612412578081fd5b60208402808660c0850137820160c00190815260809091019190915295945050505050565b6020808252601d908201527f536f6c7665723a3a20546869732068617320616c72656164792072756e000000604082015260600190565b6020808252601e908201527f536f6c7665723a204b6565706572206164647265737320696e76616c69640000604082015260600190565b60208082526026908201527f536f6c7665723a204172626974726174696f6e20686173206265656e2064656c60408201527f6976657265640000000000000000000000000000000000000000000000000000606082015260800190565b60208082526012908201527f536f6c7665723a20556e65786563757465640000000000000000000000000000604082015260600190565b6020808252601e908201527f536f6c7665723a204172626974726174696f6e2069732070656e64696e670000604082015260600190565b6020808252601f908201527f536f6c7665723a204172626974726174696f6e206e6f742070656e64696e6700604082015260600190565b6020808252602e908201527f536f6c7665723a204f6e6c79207468652041726269746572206164647265737360408201527f206d61792063616c6c2074686973000000000000000000000000000000000000606082015260800190565b60208082526018908201527f536f6c7665723a3a696e73756666696369656e74206574680000000000000000604082015260600190565b60208082526019908201527f536f6c7665723a20536f6c766520697320636f6d706c65746500000000000000604082015260600190565b60208082526033908201527f536f6c7665723a204f6e6c792074686520736f6c7574696f6e7348756220616460408201527f6472657373206d61792063616c6c207468697300000000000000000000000000606082015260800190565b60208082526014908201527f536f6c7665723a3a63616c6c206661696c757265000000000000000000000000604082015260600190565b60208082526026908201527f536f6c7665723a204f6e6c79207468697320736f6c766572206d61792063616c60408201527f6c20746869730000000000000000000000000000000000000000000000000000606082015260800190565b60208082526031908201527f536f6c7665723a204f6e6c7920746865204b6565706572206f7220417262697460408201527f6572206d61792063616c6c20746869732e000000000000000000000000000000606082015260800190565b60208082526027908201527f536f6c7665723a2054696d656c6f636b206973207374696c6c20696e2074686560408201527f2066757475726500000000000000000000000000000000000000000000000000606082015260800190565b60208082526017908201527f536f6c7665723a3a616374696f6e206578656375746564000000000000000000604082015260600190565b6000808335601e1984360301811261286a578283fd5b83018035915067ffffffffffffffff821115612884578283fd5b6020908101925081023603821315611bbe57600080fd5b60405181810167ffffffffffffffff811182821017156128bd576128bd612992565b604052919050565b600082198211156128d8576128d861297c565b500190565b60008160001904831182151516156128f7576128f761297c565b500290565b60005b838110156129175781810151838201526020016128ff565b83811115612926576000848401525b50505050565b60028104600182168061294057607f821691505b60208210811415611a5857634e487b7160e01b600052602260045260246000fd5b60006000198214156129755761297561297c565b5060010190565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b038116811461134d57600080fd5b801515811461134d57600080fdfea2646970667358221220b3f6e97154685eb896e8ee5ddebe0a6be7463e95c72abd51101cbd6bc1d2d54264736f6c63430008000033";

export class SolverCloneFactory__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<SolverCloneFactory> {
    return super.deploy(overrides || {}) as Promise<SolverCloneFactory>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): SolverCloneFactory {
    return super.attach(address) as SolverCloneFactory;
  }
  connect(signer: Signer): SolverCloneFactory__factory {
    return super.connect(signer) as SolverCloneFactory__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SolverCloneFactoryInterface {
    return new utils.Interface(_abi) as SolverCloneFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SolverCloneFactory {
    return new Contract(address, _abi, signerOrProvider) as SolverCloneFactory;
  }
}
