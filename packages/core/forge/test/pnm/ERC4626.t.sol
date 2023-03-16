// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@pwnednomore/contracts/PTest.sol";
import "forge-std/StdInvariant.sol";

import {BondController} from "tranche/BondController.sol";
import {Tranche} from "tranche/Tranche.sol";
import {BondFactory} from "tranche/BondFactory.sol";
import {LoanRouter} from "tranche/LoanRouter.sol";
import {TrancheFactory} from "tranche/TrancheFactory.sol";
import {UniV2LoanRouter} from "tranche/UniV2LoanRouter.sol";
import {UniV3LoanRouter} from "tranche/UniV3LoanRouter.sol";
import {WamplLoanRouter} from "tranche/WamplLoanRouter.sol";
import {WethLoanRouter} from "tranche/WethLoanRouter.sol";
import {IButtonWrapper} from "tranche/interfaces/IButtonWrapper.sol";

contract BondControllerTest is PTest {
    uint256 forkId;

    Tranche tranche = Tranche(0xa07Df4a1721bF151104234A8B73B93e5E371f7e8);
    BondController bondController =
        BondController(0x8c624D6a336edE5da3bDA01574cF091A938EA906);
    UniV3LoanRouter uv3lr =
        UniV3LoanRouter(0x5bDD0812f0F6CE66024ddAA92650F838e94d253E);
    WamplLoanRouter wlr =
        WamplLoanRouter(0x06111C76430d31C640228609f334c207547fAaB8);
    WethLoanRouter wthlr =
        WethLoanRouter(0x2119BD77031D5A6c69D7B15A3a73E15a91CBc721);
    IButtonWrapper bWETH =
        IButtonWrapper(0x8F471E1896D16481678db553F86283EAB1561B02);
    IButtonWrapper bWAMPL =
        IButtonWrapper(0x6484F9c02fe1a0ed1edE923BE36243d361A480F5);
    IButtonWrapper bWBTC =
        IButtonWrapper(0x8e8212386d580D8dD731a2B1a36A43935250304e);

    address USER = address(0x1);
    address agent;

    function setUp() external {
        forkId = vm.createSelectFork(vm.rpcUrl("mainnet"), 16833213);

        targetContract(address(tranche));
        targetContract(address(bondController));
        targetContract(address(uv3lr));
        targetContract(address(wlr));
        targetContract(address(wthlr));
        targetContract(address(bWETH));
        targetContract(address(bWAMPL));
        targetContract(address(bWBTC));

        agent = getAgent();
        hoax(agent, 1 ether);
    }

    // Invariants:
    // - `totalDebt` should always equal the sum of all tranche tokens' `totalSupply()`
    function invariantTotalDebt() external view {
        assert(bondController.totalDebt() == tranche.totalSupply());
    }
}
