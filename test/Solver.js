const { ethers } = require("hardhat")
const { expect } = require("chai");
const SolverABI = require("../artifacts/contracts/Solver.sol/Solver.json").abi;
const { FormatTypes } = require("ethers/lib/utils");

describe("It should all work", function() {

    this.beforeEach(async function() {
        const [buyer, seller, keeper, arbiter] = await ethers.getSigners();
        this.buyer = buyer;
        this.seller = seller;
        this.keeper = keeper;
        this.arbiter = arbiter;

        this.ToyTokenFactory = await ethers.getContractFactory("ToyToken")
        this.ToyToken = await this.ToyTokenFactory.deploy("TOY", "TOY")
        await this.ToyToken.mint(this.buyer.address, '100')

        this.CTFactory = await ethers.getContractFactory("ConditionalTokens")
        this.CT = await this.CTFactory.deploy()

        console.log(this.CT.address);

        this.ProposalsHubFactory = await ethers.getContractFactory("ProposalsHub")
        this.ProposalsHub = await this.ProposalsHubFactory.deploy()

        this.SolutionsHubFactory = await ethers.getContractFactory("SolutionsHub")
        this.SolutionsHub = await this.SolutionsHubFactory.deploy(this.CT.address)


        this.SolverFactoryFactory = await ethers.getContractFactory("SolverFactory")
        this.SolverFactory = await this.SolverFactoryFactory.deploy()

        this.provider = await ethers.getDefaultProvider()



        const ISolver = new ethers.utils.Interface(SolverABI)
        ISolver.format(FormatTypes.full);
        
        const actions = [
            // createCondition
            [
                ethers.constants.AddressZero, // to address
                false, // bool executed
                true, // useSolverIdx
                0, // solverIdx
                0, // value
                ISolver.encodeFunctionData("createCondition", [ethers.utils.formatBytes32String("test"), 2])
            ],
            // splitCondition
            [
                ethers.constants.AddressZero, // to address
                false, // bool executed
                true, // useSolverIdx
                0, // solverIdx
                0, // value
                ISolver.encodeFunctionData("splitCondition", [ethers.utils.formatBytes32String("test"), ethers.utils.formatBytes32String(""), 2, [1,2], this.ToyToken.address, 100])
            ],
            [
                ethers.constants.AddressZero, // to address
                false, // bool executed
                true, // useSolverIdx
                0, // solverIdx
                0, // value
                ISolver.encodeFunctionData("allocatePartition", [ethers.utils.formatBytes32String("test"), 2, ethers.utils.formatBytes32String(""), this.ToyToken.address, [1,2], [[0,100],[100,0]],[[this.seller.address, this.buyer.address],[this.seller.address, this.buyer.address]]])
            ]
        ]
        
        this.solverConfigs = [[
            this.SolverFactory.address, 
            this.keeper.address, 
            this.arbiter.address, 
            0, 
            ethers.utils.formatBytes32String(""), 
            actions
        ]]



    })


    it("Should create a Solution", async function() {
        let tx = await this.SolutionsHub.connect(this.keeper).createSolution(this.solverConfigs);
        let receipt = await tx.wait()
        let iface = new ethers.utils.Interface(["event CreateSolution(bytes32 id)"])
        const solutionId = iface.parseLog(receipt.logs[0]).args.id;
        const solution = await this.SolutionsHub.getSolution(solutionId);
        expect(solutionId).to.equal('0x320723cfc0bfa9b0f7c5b275a01ffa5e0f111f05723ba5df2b2684ab86bebe06') 
        expect(solution.id).to.equal('0x320723cfc0bfa9b0f7c5b275a01ffa5e0f111f05723ba5df2b2684ab86bebe06') 

    })

    it("Should create a Proposal", async function() {
        //Create solution
        let tx = await this.SolutionsHub.connect(this.keeper).createSolution(this.solverConfigs);
        let receipt = await tx.wait()
        let iface = new ethers.utils.Interface(["event CreateSolution(bytes32 id)"])
        const solutionId = iface.parseLog(receipt.logs[0]).args.id;
        const solution = await this.SolutionsHub.getSolution(solutionId);

        //Create proposal
        let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(this.ToyToken.address, this.SolutionsHub.address, 100, solutionId)  
        let receipt2 = await tx2.wait()
        let iface2 = new ethers.utils.Interface(["event CreateProposal(bytes32 id)"])
        const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;
        const proposal = await this.ProposalsHub.getProposal(proposalId);
        expect(proposalId).to.equal('0xa06e7b028084ed6c8694d0574cfc7943c8d93ce3ce4a0a0d3834907dd8a4971d') 
        expect(proposal.id).to.equal('0xa06e7b028084ed6c8694d0574cfc7943c8d93ce3ce4a0a0d3834907dd8a4971d') 
        
    })

    it("Should execute Proposal", async function() {
        //Create solution
        let tx = await this.SolutionsHub.connect(this.keeper).createSolution(this.solverConfigs);
        let receipt = await tx.wait()
        let iface = new ethers.utils.Interface(["event CreateSolution(bytes32 id)"])
        const solutionId = iface.parseLog(receipt.logs[0]).args.id;
        const solution = await this.SolutionsHub.getSolution(solutionId);

        //Create proposal
        let tx2 = await this.ProposalsHub.connect(this.keeper).createProposal(this.ToyToken.address, this.SolutionsHub.address, 100, solutionId)  
        let receipt2 = await tx2.wait()
        let iface2 = new ethers.utils.Interface(["event CreateProposal(bytes32 id)"])
        const proposalId = iface2.parseLog(receipt2.logs[0]).args.id;
        const proposal = await this.ProposalsHub.getProposal(proposalId);

        //Fund and execute Proposal
        await this.ToyToken.connect(this.buyer).approve(this.ProposalsHub.address, 100)
        await this.ProposalsHub.connect(this.buyer).fundProposal(proposalId, this.ToyToken.address, 100)
        await this.ProposalsHub.executeProposal(proposalId);
    })


})