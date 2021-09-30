const { ethers, deployments } = require("hardhat");
const { expect } = require("chai");
const CT_ABI = require("../artifacts/contracts/ConditionalTokens.sol/ConditionalTokens.json").abi;
const SOLVER_ABI = require("../artifacts/contracts/Solver.sol/Solver.json").abi;
const SOLUTIONSHUB_ABI = require("../artifacts/contracts/SolutionsHub.sol/SolutionsHub.json").abi;
const { FormatTypes } = require("ethers/lib/utils");
const { getIndexSetFromBinaryArray } = require("../helpers/ConditionalTokens.js")
const { getCTBalances, redeemPositions } = require("../helpers/testHelpers.js")
const {
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');


describe("It should all work", async function () {
  this.beforeEach(async function () {
    
    const [buyer, seller, keeper, seller2, arbitrator] = await ethers.getSigners();

    
    this.buyer = buyer;
    this.seller = seller;
    this.seller2 = seller2;
    this.keeper = keeper;
    this.arbitrator = arbitrator;

    await deployments.fixture(["ConditionalTokens", "SolverFactory", "SolutionsHub", "ProposalsHub", "ToyToken", "BasicSolverV1"]);
    this.CT = await ethers.getContract("ConditionalTokens")
    this.SolverFactory = await ethers.getContract("SolverFactory")
    this.SolutionsHub = await ethers.getContract("SolutionsHub")
    this.ProposalsHub = await ethers.getContract("ProposalsHub")
    this.ToyToken = await ethers.getContract("ToyToken")
    this.Solver = await ethers.getContract("BasicSolverV1")
    
    await this.ToyToken.mint(this.buyer.address, "100");


    this.ISolver = new ethers.utils.Interface(SOLVER_ABI);
    this.ISolver.format(FormatTypes.full);

    this.ISolutionsHub = new ethers.utils.Interface(SOLUTIONSHUB_ABI);
    this.ISolutionsHub.format(FormatTypes.full);
  });
  

  it("Should allow a retry from Solver0 in a 2-solver proposal", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID")
  
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const ingests0 = [
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.buyer.address])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: false,
        dataType: 0,
        key: 2,
        solverIndex: 0,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex",[1])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 4,
        key: 4,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 4,
        key: 5,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [100])
      }
    ]


    const conditionBase0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amount: 100,
      partition: [1,2],
      recipientAddressSlots: [1,2],
      recipientAmountSlots: [[4,5],[5,4]],
      conditionURI: ""
    }
  
    // Second Solver
    const ingests1 = [
      {
        executions: 0,
        isDeferred: false,
        isConstant: false,
        dataType: 0,
        key: 1,
        solverIndex: 1,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex",[0])
      },
      {
        executions: 0,
        isDeferred: true,
        isConstant: false,
        dataType: 0,
        key: 2,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [3]) // deferredIngests take the key of slot in solver passing it down
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 4,
        key: 3,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 4,
        key: 4,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [100])
      }
    ]

    const conditionBase1 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 1,
      amount: 100,
      partition: [1,2],
      recipientAddressSlots: [1,2],
      recipientAmountSlots: [[3,4],[4,3]],
      conditionURI: ""
    }

  
    const solverConfigs = [
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests0,
        conditionBase0
      ],
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests1,
        conditionBase1
      ],
    ];
    //////////////////////////////////////////
  
    await this.SolutionsHub.connect(this.keeper).createSolution(
      solutionId,
      this.ToyToken.address,
      solverConfigs
    );
  
  
    //Create proposal
    let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.SolutionsHub.address,
      100,
      solutionId
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;
  
    //Fund and execute Proposal
    await this.ToyToken.connect(this.buyer).approve(
      this.ProposalsHub.address,
      100
    );
    await this.ProposalsHub.connect(this.buyer).fundProposal(
      proposalId,
      this.ToyToken.address,
      100
    );
  
    let splitPositionEvents = [];
    let tx = await this.ProposalsHub.executeProposal(proposalId);
    let rc = await tx.wait();
    let iface = new ethers.utils.Interface(CT_ABI);
    let events = rc.logs.map(log => {
      try {
        return iface.parseLog(log)
      } catch(err){}
    });
    events.forEach(event => {
      if (event && event.name == "PositionSplit"){
        console.log("PositionSplit event: ", event)
        splitPositionEvents.push(event)
      }
    })
  
    const solver0Address = await this.SolutionsHub.solverFromIndex(solutionId, 0);
    const solver1Address = await this.SolutionsHub.solverFromIndex(solutionId, 1);

    const solverERC20Balance = await this.ToyToken.balanceOf(solver0Address);
    const CTERC20Balance = await this.ToyToken.balanceOf(this.CT.address);
    // Collateral has been sent to CT contract
    expect(solverERC20Balance).to.equal(0);
    expect(CTERC20Balance).to.equal(100);
  
    
    // Seller should have all the success tokens
    const indexSetSuccess = getIndexSetFromBinaryArray([1,0]) // If success
    const indexSetFailure = getIndexSetFromBinaryArray([0,1]) // If failure
  
    console.log("index set success: ", indexSetSuccess)
    console.log("index set failure: ", indexSetFailure)

    let solver0 = new ethers.Contract(solver0Address, SOLVER_ABI, ethers.provider);
    let solver1 = new ethers.Contract(solver1Address, SOLVER_ABI, ethers.provider);


    // // Add deferred data to solver0 and fetch it from solver1
    await solver0.connect(this.keeper).addData(0, 3, ethers.utils.defaultAbiCoder.encode(['address'], [this.seller.address]));

    tx = await solver1.connect(this.keeper).executeSolve(0);
    rc = await tx.wait();
    events = rc.logs.map(log => {
      try {
        return iface.parseLog(log)
      } catch(err){}
    });
    events.forEach(event => {
      if (event && event.name == "PositionSplit"){
        splitPositionEvents.push(event)
      }
    })

    // Keeper proposes payouts
    await solver0.connect(this.keeper).proposePayouts(0,[1,0]); // success, found someone
    await solver1.connect(this.keeper).proposePayouts(0,[0,1]); // failure, work bad
    await solver0.connect(this.keeper).confirmPayouts(0);
    await solver1.connect(this.keeper).confirmPayouts(0);



    // Redeem "failure" CTs  sent back from downstream solver up to ERC20 and prepare new Solve
    await solver0.connect(this.keeper).redeemPosition(
        splitPositionEvents[1].args.collateralToken, 
        splitPositionEvents[1].args.parentCollectionId, 
        splitPositionEvents[1].args.conditionId, 
        splitPositionEvents[1].args.partition
        );
    await solver0.connect(this.keeper).redeemPosition(
        splitPositionEvents[0].args.collateralToken, 
        splitPositionEvents[0].args.parentCollectionId, 
        splitPositionEvents[0].args.conditionId, 
        splitPositionEvents[0].args.partition
        );

    await solver0.connect(this.keeper).prepareSolve(1);
    await solver0.connect(this.keeper).addData(0, 3, ethers.utils.defaultAbiCoder.encode(['address'], [this.seller2.address]));
    await solver0.connect(this.keeper).executeSolve(1);


    await solver0.connect(this.keeper).proposePayouts(1,[1,0]); // success, found someone
    await solver0.connect(this.keeper).confirmPayouts(1);
    await solver1.connect(this.keeper).proposePayouts(1,[1,0]); // success, work good
    await solver1.connect(this.keeper).confirmPayouts(1);


    await getCTBalances(this.CT, this.seller2.address, solver0, [indexSetSuccess, indexSetFailure]);
    await getCTBalances(this.CT, this.seller2.address, solver1, [indexSetSuccess, indexSetFailure]);

    await redeemPositions(this.CT, this.seller2, solver1, [indexSetSuccess, indexSetFailure]);
    await getCTBalances(this.CT, this.seller2.address, solver1, [indexSetSuccess, indexSetFailure]);

    await redeemPositions(this.CT, this.seller2, solver0, [indexSetSuccess, indexSetFailure]);
    
    // Seller redeems tokens
    const sellerERC20Balance = await this.ToyToken.balanceOf(this.seller2.address);
    expect(sellerERC20Balance).to.equal(100);
  });


  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  it("Shouldn't require downstream Solver to have reported before retrying", async function () {
    //Create solution
    const solutionId = ethers.utils.formatBytes32String("TestID")
  
    /////////INGESTS & ACTIONS & CONFIG ///////////////
    const ingests0 = [
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 0,
        key: 1,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['address'], [this.buyer.address])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: false,
        dataType: 0,
        key: 2,
        solverIndex: 0,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex",[1])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 4,
        key: 3,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 4,
        key: 4,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [100])
      }
    ]


    const conditionBase0 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 0,
      amount: 100,
      partition: [1,2],
      recipientAddressSlots: [1,2],
      recipientAmountSlots: [[3,4],[4,3]],
      conditionURI: ""
    }
  
    // Second Solver
    const ingests1 = [
      {
        executions: 0,
        isDeferred: false,
        isConstant: false,
        dataType: 0,
        key: 1,
        solverIndex: 1,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex",[0])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: false,
        dataType: 0,
        key: 2,
        solverIndex: 2,
        data: this.ISolver.encodeFunctionData("addressFromChainIndex",[2])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 4,
        key: 3,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0])
      },
      {
        executions: 0,
        isDeferred: false,
        isConstant: true,
        dataType: 4,
        key: 4,
        solverIndex: 0,
        data: ethers.utils.defaultAbiCoder.encode(['uint256'], [100])
      }
    ]

    const conditionBase1 = {
      collateralToken: this.ToyToken.address,
      outcomeSlots: 2,
      parentCollectionIndexSet: 1,
      amount: 100,
      partition: [1,2],
      recipientAddressSlots: [1,2],
      recipientAmountSlots: [[3,4],[4,3]],
      conditionURI: ""
    }

    // Third Solver
    const ingests2 = [
        {
            executions: 0,
            isDeferred: false,
            isConstant: false,
            dataType: 0,
            key: 1,
            solverIndex: 1,
            data: this.ISolver.encodeFunctionData("addressFromChainIndex",[1])
        },
        {
            executions: 0,
            isDeferred: true,
            isConstant: false,
            dataType: 0,
            key: 2,
            solverIndex: 0,
            data: ethers.utils.defaultAbiCoder.encode(['uint256'], [5]) // get seller from solver0
        },
        {
            executions: 0,
            isDeferred: false,
            isConstant: true,
            dataType: 4,
            key: 3,
            solverIndex: 0,
            data: ethers.utils.defaultAbiCoder.encode(['uint256'], [0])
        },
        {
            executions: 0,
            isDeferred: false,
            isConstant: true,
            dataType: 4,
            key: 4,
            solverIndex: 0,
            data: ethers.utils.defaultAbiCoder.encode(['uint256'], [100])
        },
        {
            executions: 0,
            isDeferred: true,
            isConstant: false,
            dataType: 3,
            key: 5,
            solverIndex: 1,
            data: ethers.utils.defaultAbiCoder.encode(['uint256'], [5]) // get content data from solver1
        }
        ]
    
        const conditionBase2 = {
        collateralToken: this.ToyToken.address,
        outcomeSlots: 2,
        parentCollectionIndexSet: 1,
        amount: 100,
        partition: [1,2],
        recipientAddressSlots: [1,2],
        recipientAmountSlots: [[3,4],[4,3]],
        conditionURI: ""
        }

  
    const solverConfigs = [
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests0,
        conditionBase0
      ],
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests1,
        conditionBase1
      ],
      [
        this.Solver.address,
        this.keeper.address,
        this.arbitrator.address,
        0,
        ethers.utils.formatBytes32String(""),
        ingests2,
        conditionBase2
      ],
    ];
    //////////////////////////////////////////
  
    await this.SolutionsHub.connect(this.keeper).createSolution(
      solutionId,
      this.ToyToken.address,
      solverConfigs
    );
  
  
    //Create proposal
    let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(
      this.ToyToken.address,
      this.SolutionsHub.address,
      100,
      solutionId
    );
    let receipt2 = await tx2.wait();
    let iface2 = new ethers.utils.Interface([
      "event CreateProposal(bytes32 id)",
    ]);
    const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;
  
    //Fund and execute Proposal
    await this.ToyToken.connect(this.buyer).approve(
      this.ProposalsHub.address,
      100
    );
    await this.ProposalsHub.connect(this.buyer).fundProposal(
      proposalId,
      this.ToyToken.address,
      100
    );
  
    let splitPositionEvents = [];
    let tx = await this.ProposalsHub.executeProposal(proposalId);
    let rc = await tx.wait();
    let iface = new ethers.utils.Interface(CT_ABI);
    let events = rc.logs.map(log => {
      try {
        return iface.parseLog(log)
      } catch(err){}
    });
    events.forEach(event => {
      if (event && event.name == "PositionSplit"){
        // console.log("PositionSplit event: ", event)
        splitPositionEvents.push(event)
      }
    })
  
    const solver0Address = await this.SolutionsHub.solverFromIndex(solutionId, 0);
    const solver1Address = await this.SolutionsHub.solverFromIndex(solutionId, 1);
    const solver2Address = await this.SolutionsHub.solverFromIndex(solutionId, 2);

    console.log(`Solver0: ${solver0Address} | Solver1: ${solver1Address} | Solver2: ${solver2Address}`)

    const solverERC20Balance = await this.ToyToken.balanceOf(solver0Address);
    const CTERC20Balance = await this.ToyToken.balanceOf(this.CT.address);
    // Collateral has been sent to CT contract
    expect(solverERC20Balance).to.equal(0);
    expect(CTERC20Balance).to.equal(100);
  
    
    // Seller should have all the success tokens
    const indexSetSuccess = getIndexSetFromBinaryArray([1,0]) // If success
    const indexSetFailure = getIndexSetFromBinaryArray([0,1]) // If failure
  
    console.log("index set success: ", indexSetSuccess)
    console.log("index set failure: ", indexSetFailure)

    let solver0 = new ethers.Contract(solver0Address, SOLVER_ABI, ethers.provider);
    let solver1 = new ethers.Contract(solver1Address, SOLVER_ABI, ethers.provider);
    let solver2 = new ethers.Contract(solver2Address, SOLVER_ABI, ethers.provider);



    // // Add deferred data to solver0 and fetch it from solver1
    await solver0.connect(this.keeper).addData(0, 5, ethers.utils.defaultAbiCoder.encode(['address'], [this.seller.address]));
    await solver0.connect(this.keeper).proposePayouts(0, [1,0]); // success, found someone
    await solver0.connect(this.keeper).confirmPayouts(0);


    await solver1.connect(this.keeper).addData(4, 5, ethers.utils.defaultAbiCoder.encode(['bytes'], [ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some content URI"))]));

    // Meanwhile, Solver2 executes as well
    tx = await solver2.connect(this.keeper).executeSolve(0);
    rc = await tx.wait();
    events = rc.logs.map(log => {
      try {
        return iface.parseLog(log)
      } catch(err){}
    });
    events.forEach(event => {
      if (event && event.name == "PositionSplit"){
        splitPositionEvents.push(event)
      }
    })

    await solver1.connect(this.keeper).proposePayouts(0,[0,1]); // failure, work bad
    await solver1.connect(this.keeper).confirmPayouts(0);


    // Redeem "failure" CTs  sent back from downstream solver up to ERC20 and prepare new Solve
    await solver0.connect(this.keeper).redeemPosition(
        splitPositionEvents[1].args.collateralToken, 
        splitPositionEvents[1].args.parentCollectionId, 
        splitPositionEvents[1].args.conditionId, 
        splitPositionEvents[1].args.partition
        );
    await solver0.connect(this.keeper).redeemPosition(
        splitPositionEvents[0].args.collateralToken, 
        splitPositionEvents[0].args.parentCollectionId, 
        splitPositionEvents[0].args.conditionId, 
        splitPositionEvents[0].args.partition
        );

    await solver0.connect(this.keeper).prepareSolve(1);
    tx = await solver0.connect(this.keeper).executeSolve(1);
    rc = await tx.wait();
    events = rc.logs.map(log => {
      try {
        return iface.parseLog(log)
      } catch(err){}
    });
    events.forEach(event => {
      if (event && event.name == "PositionSplit"){
        splitPositionEvents.push(event)
      }
    })


    await solver0.connect(this.keeper).addData(0, 5, ethers.utils.defaultAbiCoder.encode(['address'], [this.seller2.address]));
    await solver1.connect(this.keeper).addData(0, 5, ethers.utils.defaultAbiCoder.encode(['bytes'], [ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some content URI"))]));
    
    console.log("execute solver2")
    tx = await solver2.connect(this.keeper).executeSolve(1);
    rc = await tx.wait();
    events = rc.logs.map(log => {
      try {
        return iface.parseLog(log)
      } catch(err){}
    });
    events.forEach(event => {
      if (event && event.name == "PositionSplit"){
        splitPositionEvents.push(event)
      }
    })
    console.log("executed solver2")


    await solver0.connect(this.keeper).proposePayouts(1,[1,0]); // success, found someone
    await solver0.connect(this.keeper).confirmPayouts(1);
    await solver1.connect(this.keeper).proposePayouts(1,[1,0]); // success, work good
    await solver1.connect(this.keeper).confirmPayouts(1);
    await solver2.connect(this.keeper).proposePayouts(1,[1,0]); // success, work good
    await expectRevert(solver2.connect(this.keeper).proposePayouts(1,[1,0]), "Condition not Executed"); // can't report again

    await solver2.connect(this.keeper).confirmPayouts(1);

    await redeemPositions(this.CT, this.seller2, solver2, [indexSetSuccess, indexSetFailure]);
    await redeemPositions(this.CT, this.seller2, solver1, [indexSetSuccess, indexSetFailure]);
    await redeemPositions(this.CT, this.seller2, solver0, [indexSetSuccess, indexSetFailure]);
    
    // The first Solve for Solver2 should still be active and reportable
    await solver2.connect(this.keeper).proposePayouts(0,[0,1]); // success, work good

    // Seller redeems tokens
    const sellerERC20Balance = await this.ToyToken.balanceOf(this.seller2.address);
    expect(sellerERC20Balance).to.equal(100);
  });
});

