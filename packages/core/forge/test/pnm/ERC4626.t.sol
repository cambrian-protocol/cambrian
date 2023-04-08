// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "narya-contracts/PTest.sol";
import "narya-contracts/lib/forge-std/src/StdInvariant.sol";
// comment
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
import {ButtonToken} from "button-wrappers/contracts/ButtonToken.sol";
import {ButtonTokenFactory} from "button-wrappers/contracts/ButtonTokenFactory.sol";
import {ButtonTokenWamplRouter} from "button-wrappers/contracts/ButtonTokenWamplRouter.sol";
import {ButtonTokenWethRouter} from "button-wrappers/contracts/ButtonTokenWethRouter.sol";
import {UnbuttonToken} from "button-wrappers/contracts/UnbuttonToken.sol";
import {UnbuttonTokenFactory} from "button-wrappers/contracts/UnbuttonTokenFactory.sol";

contract BondControllerTest is PTest, StdInvariant {
    address agent;
    uint256 forkId;

    Tranche tranche = Tranche(0xa07Df4a1721bF151104234A8B73B93e5E371f7e8);
    BondController bondController =
        BondController(0x8c624D6a336edE5da3bDA01574cF091A938EA906);

    BondController wethBondController =
        BondController(0x791a8015b090d47aC40680721bBC64c10E456345);

    Tranche aTrancheWETH = Tranche(0x06aA2eC6Eca940716F1F2b855cA908136fa622C7);
    Tranche bTrancheWETH = Tranche(0x1554016590b567A59B47997c9b39dfaEEb947f0F);

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

    ButtonToken buttonToken =
        ButtonToken(0xAB4691aD011aDb810610e9610A74Be77c553E9F9);
    UnbuttonToken unbuttonToken =
        UnbuttonToken(0x37A528B28062096D994a0569db6be5A0550165de);
    ButtonTokenFactory buttonTokenFactory =
        ButtonTokenFactory(0x84D0F1Cd873122F2A87673e079ea69cd80b51960);
    UnbuttonTokenFactory unbuttonTokenFactory =
        UnbuttonTokenFactory(0x75ff649d6119faB43DEa5E5E9E02586f27fC8b8f);
    TrancheFactory trancheFactory =
        TrancheFactory(0xeca709A67E8e774c827547D900e01B763f77E99f);
    BondFactory bondFactory =
        BondFactory(0x71868D38Ea3b3eB5e4db9a45ee355548B46c82E0);

    // DualAuction dualAuction =
    //     DualAction(0xc8f46c1545AbAc895D3ca18f75eADD452643Cffb);
    // DualActionFactory dualAuctionFactory =
    //     DualAuctionFactory(0x1696D00fe4b0F473FaCbf1958C49090Ba55B47a2);

    ButtonTokenWethRouter buttonTokenWethRouter =
        ButtonTokenWethRouter(
            payable(0xB08c5e2E8E73d0FB9842171496B2da04E8E80A0D)
        );
    ButtonTokenWamplRouter buttonTokenWamplRouter =
        ButtonTokenWamplRouter(0x2c76A2Ce5f285f10C5674BEE172b420B4e20A983);

    function setUp() external {
        forkId = vm.createSelectFork(vm.rpcUrl("mainnet"), 16833213);

        targetContract(address(tranche));
        targetContract(address(bondController));

        targetContract(address(wethBondController));
        targetContract(address(aTrancheWETH));
        targetContract(address(bTrancheWETH));

        targetContract(address(uv3lr));
        targetContract(address(wlr));
        targetContract(address(wthlr));
        targetContract(address(bWETH));
        targetContract(address(bWAMPL));
        targetContract(address(bWBTC));

        targetContract(address(buttonToken));
        targetContract(address(unbuttonToken));
        targetContract(address(buttonTokenFactory));
        targetContract(address(unbuttonTokenFactory));
        targetContract(address(trancheFactory));
        targetContract(address(bondFactory));

        // targetContract(address(dualAuction));
        // targetContract(address(dualAuctionFactory));

        targetContract(address(buttonTokenWethRouter));
        targetContract(address(buttonTokenWamplRouter));

        agent = getAgent();
        hoax(agent, 1 ether);
    }

    function invariantStolen() external view {
        assert(agent.balance <= 1 ether);
        assert((aTrancheWETH).balanceOf(agent) == 0);
        assert((bTrancheWETH).balanceOf(agent) == 0);
    }
}
