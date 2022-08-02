// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./Owned.sol";

contract Main is Owned {
    uint256 public fundersCount;

    mapping(address => bool) private funders;
    mapping(uint256 => address) private lutFunders;

    modifier limitWithdraw(uint256 amount) {
        require(amount < 1000000000000000000, "too much for one person");
        _;
    }

    receive() external payable {}

    function withdraw(uint256 withdrawAmount) limitWithdraw(withdrawAmount) onlyOwner external {
        payable(msg.sender).transfer(withdrawAmount);
    }

    function send() external payable {
        address funder = msg.sender;
        if (!funders[funder]) {
            uint256 index = fundersCount++;
            lutFunders[index] = funder;
            funders[funder] = true;
        }
    }

    function getAllFunders() external view returns (address[] memory) {
        address[] memory _funders = new address[](fundersCount);
        for (uint256 i = 0; i < fundersCount; i++) {
            _funders[i] = lutFunders[i];
        }
        return _funders;
    }

    function getFunderByIndex(uint256 index) public view returns (address) {
        return lutFunders[index];
    }
}
