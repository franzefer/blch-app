// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Owned {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
