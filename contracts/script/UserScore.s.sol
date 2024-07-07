// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.20;

/*______     __      __                              __      __ 
 /      \   /  |    /  |                            /  |    /  |
/$$$$$$  | _$$ |_   $$ |____    ______   _______   _$$ |_   $$/   _______ 
$$ |  $$ |/ $$   |  $$      \  /      \ /       \ / $$   |  /  | /       |
$$ |  $$ |$$$$$$/   $$$$$$$  |/$$$$$$  |$$$$$$$  |$$$$$$/   $$ |/$$$$$$$/ 
$$ |  $$ |  $$ | __ $$ |  $$ |$$    $$ |$$ |  $$ |  $$ | __ $$ |$$ |
$$ \__$$ |  $$ |/  |$$ |  $$ |$$$$$$$$/ $$ |  $$ |  $$ |/  |$$ |$$ \_____ 
$$    $$/   $$  $$/ $$ |  $$ |$$       |$$ |  $$ |  $$  $$/ $$ |$$       |
 $$$$$$/     $$$$/  $$/   $$/  $$$$$$$/ $$/   $$/    $$$$/  $$/  $$$$$$$/
*/
/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */

import {Script, console} from "forge-std/Script.sol";
import '../src/IAttestationCenter.sol';
import '../src/UserScore.sol';

// How to:
// Either `source ../../.env` or replace variables in command.
// forge script PRNGDeploy --rpc-url https://polygon-amoy.g.alchemy.com/v2/ZAb5Lm8DYTZjtnkiJthyYWODWGqATMBM --private-key 8383781b9e089b5c3a37f9b94dc5ace9d326e421017a5e524800558eb447bb48
// --broadcast -vvvv --verify --etherscan-api-key NE4PBPDBHKGXX9FXGRXQBCZ8HD7HCCVU8E --chain
// 80002 --verifier-url https://api-amoy.polygonscan.com/api/
contract UserScoreDeploy is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        UserScore userScore = new UserScore(0x40799efa4706292536654badB132ED613AC1B1CC);
        IAttestationCenter(0x40799efa4706292536654badB132ED613AC1B1CC).setAvsLogic(address(userScore));
    }
}