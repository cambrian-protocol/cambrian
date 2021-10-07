// const { ethers, deployments } = require("hardhat");
// const { expect } = require("chai");
// const CT_ABI =
//   require("../../artifacts/contracts/ConditionalTokens.sol/ConditionalTokens.json").abi;
// const SOLVER_ABI =
//   require("../../artifacts/contracts/Solver.sol/Solver.json").abi;
// const SOLUTIONSHUB_ABI =
//   require("../../artifacts/contracts/SolutionsHub.sol/SolutionsHub.json").abi;
// const { FormatTypes } = require("ethers/lib/utils");
// const {
//   getIndexSetFromBinaryArray,
// } = require("../../helpers/ConditionalTokens.js");
// const testHelpers = require("../../helpers/testHelpers.js");
const { getBytes32FromMultihash } = require("../../helpers/multihash.js");

// const {
//   expectRevert, // Assertions for transactions that should fail
// } = require("@openzeppelin/test-helpers");

// describe("It should all work", async function () {
//   this.beforeEach(async function () {
//     const [buyer, seller, keeper, seller2, arbitrator] =
//       await ethers.getSigners();

//     this.buyer = buyer;
//     this.seller = seller;
//     this.seller2 = seller2;
//     this.keeper = keeper;
//     this.arbitrator = arbitrator;

//     await deployments.fixture([
//       "ConditionalTokens",
//       "SolverFactory",
//       "ToyToken",
//       "BasicSolverV1",
//     ]);
//     this.CT = await ethers.getContract("ConditionalTokens");
//     this.SolverFactory = await ethers.getContract("SolverFactory");
//     this.ToyToken = await ethers.getContract("ToyToken");
//     this.Solver = await ethers.getContract("BasicSolverV1");
//     this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
//     this.ISolver.format(FormatTypes.full);

//     await this.ToyToken.mint(this.buyer.address, "100");
//   });

//   it("Should allow a retry from Solver0 in a 2-solver proposal", async function () {
//     /////////INGESTS & ACTIONS & CONFIG ///////////////
//     const ingests0 = [
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:1,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(
//           ["address"],
//           [this.buyer.address]
//         ),
//       },
//       {
//         executions: 0,
//         ingestType: 2,

//         slot:2,
//         solverIndex: 0,
//         data: this.ISolver.encodeFunctionData("addressFromChainIndex", [1]),
//       },
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:4,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
//       },
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:5,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
//       },
//     ];

//     const conditionBase0 = {
//       collateralToken: this.ToyToken.address,
//       outcomeSlots: 2,
//       parentCollectionIndexSet: 0,
//       amountSlot: 5,
//       partition: [1, 2],
//       recipientAddressSlots: [1, 2],
//       recipientAmountSlots: [
//         [4, 5],
//         [5, 4],
//       ],
//             outcomeURIs: [
//   getBytes32FromMultihash(
//     "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ"
//   ),
//   getBytes32FromMultihash(
//     "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP"
//   ),
// ],
//     };

//     // Second Solver
//     const ingests1 = [
//       {
//         executions: 0,
//         ingestType: 2,

//         slot:1,
//         solverIndex: 1,
//         data: this.ISolver.encodeFunctionData("addressFromChainIndex", [0]),
//       },
//       {
//         executions: 0,
//         ingestType: 0,

//         slot:2,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [3]), // deferredIngests take the key of slot in solver passing it down
//       },
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:3,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
//       },
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:4,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
//       },
//     ];

//     const conditionBase1 = {
//       collateralToken: this.ToyToken.address,
//       outcomeSlots: 2,
//       parentCollectionIndexSet: 1,
//       amountSlot: 4,
//       partition: [1, 2],
//       recipientAddressSlots: [1, 2],
//       recipientAmountSlots: [
//         [3, 4],
//         [4, 3],
//       ],
//             outcomeURIs: [
//   getBytes32FromMultihash(
//     "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ"
//   ),
//   getBytes32FromMultihash(
//     "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP"
//   ),
// ],
//     };

//     const solverConfigs = [
//       [
//         this.Solver.address,
//         this.keeper.address,
//         this.arbitrator.address,
//         0,
//         ethers.utils.formatBytes32String(""),
//         ingests0,
//         conditionBase0,
//       ],
//       [
//         this.Solver.address,
//         this.keeper.address,
//         this.arbitrator.address,
//         0,
//         ethers.utils.formatBytes32String(""),
//         ingests1,
//         conditionBase1,
//       ],
//     ];
//     //////////////////////////////////////////

//     let solvers = await testHelpers.deploySolverChain(
//       solverConfigs,
//       this.SolverFactory,
//       this.keeper
//     );

//     //Fund and execute Solver chain
//     await this.ToyToken.connect(this.buyer).transfer(solvers[0].address, 100);
//     await solvers[0].connect(this.keeper).prepareSolve(0);
//     await solvers[0].connect(this.keeper).executeSolve(0);

//     const indexSetSuccess = getIndexSetFromBinaryArray([1, 0]); // If success
//     const indexSetFailure = getIndexSetFromBinaryArray([0, 1]); // If failure
//     const indexSets = [indexSetSuccess, indexSetFailure];

//     // // Add deferred data to solvers[0] and fetch it from solvers[1]
//     await solvers[0]
//       .connect(this.keeper)
//       .addData(
//         3,
//         ethers.utils.defaultAbiCoder.encode(["address"], [this.seller.address])
//       );

//     // // Add deferred data to solver0 and fetch it from solver1
//     await solvers[0]
//       .connect(this.keeper)
//       .addData(
//         3,
//         ethers.utils.defaultAbiCoder.encode(["address"], [this.seller.address])
//       );

//     tx = await solvers[1].connect(this.keeper).executeSolve(0);
//     rc = await tx.wait();
//     events = rc.logs.map((log) => {
//       try {
//         return iface.parseLog(log);
//       } catch (err) {}
//     });
//     events.forEach((event) => {
//       if (event && event.name == "PositionSplit") {
//         splitPositionEvents.push(event);
//       }
//     });

//     await solvers[1].connect(this.keeper).executeSolve(0);
//     await solvers[0].connect(this.keeper).proposePayouts(0, [1, 0]); // success, found someone
//     await solvers[1].connect(this.keeper).proposePayouts(0, [0, 1]); // failure, work bad
//     await solvers[0].connect(this.keeper).confirmPayouts(0);
//     await solvers[1].connect(this.keeper).confirmPayouts(0);

//     // Redeem "failure" CTs  sent back from downstream solver up to ERC20 and prepare new Solve
//     await solvers[0]
//       .connect(this.keeper)
//       .redeemPosition(
//         splitPositionEvents[1].args.collateralToken,
//         splitPositionEvents[1].args.parentCollectionId,
//         splitPositionEvents[1].args.conditionId,
//         splitPositionEvents[1].args.partition
//       );
//     await solvers[0]
//       .connect(this.keeper)
//       .redeemPosition(
//         splitPositionEvents[0].args.collateralToken,
//         splitPositionEvents[0].args.parentCollectionId,
//         splitPositionEvents[0].args.conditionId,
//         splitPositionEvents[0].args.partition
//       );

//     await solvers[0].connect(this.keeper).prepareSolve(1);
//     await solvers[0]
//       .connect(this.keeper)
//       .addData(
//         3,
//         ethers.utils.defaultAbiCoder.encode(["address"], [this.seller2.address])
//       );
//     await solvers[0].connect(this.keeper).executeSolve(1);

//     await solvers[0].connect(this.keeper).proposePayouts(1, [1, 0]); // success, found someone
//     await solvers[0].connect(this.keeper).confirmPayouts(1);
//     await solvers[1].connect(this.keeper).proposePayouts(1, [1, 0]); // success, work good
//     await solvers[1].connect(this.keeper).confirmPayouts(1);

//     await testHelpers.getCTBalances(this.CT, this.seller2.address, solvers[0], [
//       indexSetSuccess,
//       indexSetFailure,
//     ]);
//     await testHelpers.getCTBalances(this.CT, this.seller2.address, solvers[1], [
//       indexSetSuccess,
//       indexSetFailure,
//     ]);

//     await testHelpers.redeemPositions(this.CT, this.seller2, solvers[1], [
//       indexSetSuccess,
//       indexSetFailure,
//     ]);
//     await testHelpers.getCTBalances(this.CT, this.seller2.address, solvers[1], [
//       indexSetSuccess,
//       indexSetFailure,
//     ]);

//     await testHelpers.redeemPositions(this.CT, this.seller2, solvers[0], [
//       indexSetSuccess,
//       indexSetFailure,
//     ]);

//     // Seller redeems tokens
//     const sellerERC20Balance = await this.ToyToken.balanceOf(
//       this.seller2.address
//     );
//     expect(sellerERC20Balance).to.equal(100);
//   });

//   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//   it("Shouldn't require downstream Solver to have reported before retrying", async function () {
//     //Create solution
//     const solutionId = ethers.utils.formatBytes32String("TestID");

//     /////////INGESTS & ACTIONS & CONFIG ///////////////
//     const ingests0 = [
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:1,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(
//           ["address"],
//           [this.buyer.address]
//         ),
//       },
//       {
//         executions: 0,
//         ingestType: 2,

//         slot:2,
//         solverIndex: 0,
//         data: this.ISolver.encodeFunctionData("addressFromChainIndex", [1]),
//       },
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:3,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
//       },
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:4,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
//       },
//     ];

//     const conditionBase0 = {
//       collateralToken: this.ToyToken.address,
//       outcomeSlots: 2,
//       parentCollectionIndexSet: 0,
//       amountSlot: 4,
//       partition: [1, 2],
//       recipientAddressSlots: [1, 2],
//       recipientAmountSlots: [
//         [3, 4],
//         [4, 3],
//       ],
//             outcomeURIs: [
//   getBytes32FromMultihash(
//     "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ"
//   ),
//   getBytes32FromMultihash(
//     "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP"
//   ),
// ],
//     };

//     // Second Solver
//     const ingests1 = [
//       {
//         executions: 0,
//         ingestType: 2,

//         slot:1,
//         solverIndex: 1,
//         data: this.ISolver.encodeFunctionData("addressFromChainIndex", [0]),
//       },
//       {
//         executions: 0,
//         ingestType: 2,

//         slot:2,
//         solverIndex: 2,
//         data: this.ISolver.encodeFunctionData("addressFromChainIndex", [2]),
//       },
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:3,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
//       },
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:4,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
//       },
//     ];

//     const conditionBase1 = {
//       collateralToken: this.ToyToken.address,
//       outcomeSlots: 2,
//       parentCollectionIndexSet: 1,
//       amountSlot: 4,
//       partition: [1, 2],
//       recipientAddressSlots: [1, 2],
//       recipientAmountSlots: [
//         [3, 4],
//         [4, 3],
//       ],
//             outcomeURIs: [
//   getBytes32FromMultihash(
//     "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ"
//   ),
//   getBytes32FromMultihash(
//     "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP"
//   ),
// ],
//     };

//     // Third Solver
//     const ingests2 = [
//       {
//         executions: 0,
//         ingestType: 2,

//         slot:1,
//         solverIndex: 1,
//         data: this.ISolver.encodeFunctionData("addressFromChainIndex", [1]),
//       },
//       {
//         executions: 0,
//         ingestType: 0,

//         slot:2,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [5]), // get seller from solvers[0]
//       },
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:3,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [0]),
//       },
//       {
//         executions: 0,
//         ingestType: 1,

//         slot:4,
//         solverIndex: 0,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [100]),
//       },
//       {
//         executions: 0,
//         ingestType: 0,

//         slot:5,
//         solverIndex: 1,
//         data: ethers.utils.defaultAbiCoder.encode(["uint256"], [5]), // get content data from solvers[1]
//       },
//     ];

//     const conditionBase2 = {
//       collateralToken: this.ToyToken.address,
//       outcomeSlots: 2,
//       parentCollectionIndexSet: 1,
//       amountSlot: 4,
//       partition: [1, 2],
//       recipientAddressSlots: [1, 2],
//       recipientAmountSlots: [
//         [3, 4],
//         [4, 3],
//       ],
//             outcomeURIs: [
//   getBytes32FromMultihash(
//     "QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ"
//   ),
//   getBytes32FromMultihash(
//     "QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP"
//   ),
// ],
//     };

//     const solverConfigs = [
//       [
//         this.Solver.address,
//         this.keeper.address,
//         this.arbitrator.address,
//         0,
//         ethers.utils.formatBytes32String(""),
//         ingests0,
//         conditionBase0,
//       ],
//       [
//         this.Solver.address,
//         this.keeper.address,
//         this.arbitrator.address,
//         0,
//         ethers.utils.formatBytes32String(""),
//         ingests1,
//         conditionBase1,
//       ],
//       [
//         this.Solver.address,
//         this.keeper.address,
//         this.arbitrator.address,
//         0,
//         ethers.utils.formatBytes32String(""),
//         ingests2,
//         conditionBase2,
//       ],
//     ];
//     //////////////////////////////////////////

//     let solvers = await testHelpers.deploySolverChain(
//       solverConfigs,
//       this.SolverFactory,
//       this.keeper
//     );

//     //Fund and execute Solver chain
//     await this.ToyToken.connect(this.buyer).transfer(solvers[0].address, 100);
//     await solvers[0].connect(this.keeper).prepareSolve(0);

//     let splitPositionEvents = [];
//     let tx = await solvers[0].connect(this.keeper).executeSolve(0);
//     let rc = await tx.wait();
//     let iface = new ethers.utils.Interface(CT_ABI);
//     let events = rc.logs.map((log) => {
//       try {
//         return iface.parseLog(log);
//       } catch (err) {}
//     });
//     events.forEach((event) => {
//       if (event && event.name == "PositionSplit") {
//         // console.log("PositionSplit event: ", event)
//         splitPositionEvents.push(event);
//       }
//     });

//     const indexSetSuccess = getIndexSetFromBinaryArray([1, 0]); // If success
//     const indexSetFailure = getIndexSetFromBinaryArray([0, 1]); // If failure
//     const indexSets = [indexSetSuccess, indexSetFailure];

//     // // Add deferred data to solvers[0] and fetch it from solvers[1]
//     await solvers[0]
//       .connect(this.keeper)
//       .addData(
//         5,
//         ethers.utils.defaultAbiCoder.encode(["address"], [this.seller.address])
//       );
//     await solvers[0].connect(this.keeper).proposePayouts(0, [1, 0]); // success, found someone
//     await solvers[0].connect(this.keeper).confirmPayouts(0);

//     await solvers[1]
//       .connect(this.keeper)
//       .addData(
//         5,
//         ethers.utils.defaultAbiCoder.encode(
//           ["bytes"],
//           [ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some content URI"))]
//         )
//       );

//     // Meanwhile, Solver2 executes as well
//     tx = await solvers[2].connect(this.keeper).executeSolve(0);
//     rc = await tx.wait();
//     events = rc.logs.map((log) => {
//       try {
//         return iface.parseLog(log);
//       } catch (err) {}
//     });
//     events.forEach((event) => {
//       if (event && event.name == "PositionSplit") {
//         splitPositionEvents.push(event);
//       }
//     });

//     await solvers[1].connect(this.keeper).proposePayouts(0, [0, 1]); // failure, work bad
//     await solvers[1].connect(this.keeper).confirmPayouts(0);

//     // Redeem "failure" CTs  sent back from downstream solver up to ERC20 and prepare new Solve
//     await solvers[0]
//       .connect(this.keeper)
//       .redeemPosition(
//         splitPositionEvents[1].args.collateralToken,
//         splitPositionEvents[1].args.parentCollectionId,
//         splitPositionEvents[1].args.conditionId,
//         splitPositionEvents[1].args.partition
//       );
//     await solvers[0]
//       .connect(this.keeper)
//       .redeemPosition(
//         splitPositionEvents[0].args.collateralToken,
//         splitPositionEvents[0].args.parentCollectionId,
//         splitPositionEvents[0].args.conditionId,
//         splitPositionEvents[0].args.partition
//       );

//     await solvers[0].connect(this.keeper).prepareSolve(1);
//     tx = await solvers[0].connect(this.keeper).executeSolve(1);
//     rc = await tx.wait();
//     events = rc.logs.map((log) => {
//       try {
//         return iface.parseLog(log);
//       } catch (err) {}
//     });
//     events.forEach((event) => {
//       if (event && event.name == "PositionSplit") {
//         splitPositionEvents.push(event);
//       }
//     });

//     await solvers[0]
//       .connect(this.keeper)
//       .addData(
//         5,
//         ethers.utils.defaultAbiCoder.encode(["address"], [this.seller2.address])
//       );
//     await solvers[1]
//       .connect(this.keeper)
//       .addData(
//         5,
//         ethers.utils.defaultAbiCoder.encode(
//           ["bytes"],
//           [ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some content URI"))]
//         )
//       );

//     tx = await solvers[2].connect(this.keeper).executeSolve(1);
//     rc = await tx.wait();
//     events = rc.logs.map((log) => {
//       try {
//         return iface.parseLog(log);
//       } catch (err) {}
//     });
//     events.forEach((event) => {
//       if (event && event.name == "PositionSplit") {
//         splitPositionEvents.push(event);
//       }
//     });

//     await solvers[0].connect(this.keeper).proposePayouts(1, [1, 0]); // success, found someone
//     await solvers[0].connect(this.keeper).confirmPayouts(1);
//     await solvers[1].connect(this.keeper).proposePayouts(1, [1, 0]); // success, work good
//     await solvers[1].connect(this.keeper).confirmPayouts(1);
//     await solvers[2].connect(this.keeper).proposePayouts(1, [1, 0]); // success, work good
//     await expectRevert(
//       solvers[2].connect(this.keeper).proposePayouts(1, [1, 0]),
//       "Condition not Executed"
//     ); // can't report again

//     await solvers[2].connect(this.keeper).confirmPayouts(1);

//     await testHelpers.redeemPositions(this.CT, this.seller2, solvers[2], [
//       indexSetSuccess,
//       indexSetFailure,
//     ]);
//     await testHelpers.redeemPositions(this.CT, this.seller2, solvers[1], [
//       indexSetSuccess,
//       indexSetFailure,
//     ]);
//     await testHelpers.redeemPositions(this.CT, this.seller2, solvers[0], [
//       indexSetSuccess,
//       indexSetFailure,
//     ]);

//     // The first Solve for Solver2 should still be active and reportable
//     await solvers[2].connect(this.keeper).proposePayouts(0, [0, 1]); // success, work good

//     // Seller redeems tokens
//     const sellerERC20Balance = await this.ToyToken.balanceOf(
//       this.seller2.address
//     );
//     expect(sellerERC20Balance).to.equal(100);
//   });
// });
