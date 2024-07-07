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

import "./IAvsLogic.sol";

contract UserScore is IAvsLogic {
    mapping(address => int256) public userScore;
    mapping(address => bool) public userExists;

    address[] public users;

    address public attestationCenter;

    constructor(address _attestationCenter) {
        attestationCenter = _attestationCenter;
    }

    function afterTaskSubmission(
        IAttestationCenter.TaskInfo calldata _taskInfo,
        bool _isApproved,
        bytes calldata _tpSignature,
        uint256[2] calldata _taSignature,
        uint256[] calldata _operatorIds
    ) external {
        // require(msg.sender == attestationCenter, "Not allowed");
        address _performerAddr = _taskInfo.taskPerformer;
        if (!userExists[_performerAddr]) {
            users.push(_performerAddr);
            userExists[_performerAddr] = true;
        }
        if (_isApproved) {
            userScore[_performerAddr] += 1;
        } else {
            userScore[_performerAddr] -= 1;
        }
    }

    function beforeTaskSubmission(
        IAttestationCenter.TaskInfo calldata _taskInfo,
        bool _isApproved,
        bytes calldata _tpSignature,
        uint256[2] calldata _taSignature,
        uint256[] calldata _operatorIds
    ) external {
        // No implementation
    }

    function getUsers() external view returns (address[] memory) {
        return users;
    }
}
