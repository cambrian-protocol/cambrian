const { ethers } = require("hardhat");
const ABI = require("../artifacts/contracts/Solver.sol/Solver.json").abi;

interface Ingest {
    executed: boolean,
    isConstant: boolean,
    port: number,
}

interface Solver {
    ingests: Array<object>;
}

class Solver {
    constructor() {
        this.ingests = [];
    }

  
  }


