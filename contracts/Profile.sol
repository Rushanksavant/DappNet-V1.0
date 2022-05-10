// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract Profile {
    // state variable
    mapping(address => string[3]) public address_name_imgHash_bio;

    function updateName(string memory _name) external {
        address_name_imgHash_bio[msg.sender][0] = _name;
    }

    function updateImg(string calldata _imgHash) external {
        address_name_imgHash_bio[msg.sender][1] = _imgHash;
    }

    function updateBio(string calldata _bio) external {
        address_name_imgHash_bio[msg.sender][2] = _bio;
    }

    // getter
    function getter(uint256 index) external view returns (string memory) {
        // to get profile detail for msg.sender
        return address_name_imgHash_bio[msg.sender][index];
    }

    function getter_Address(address add, uint256 index)
        external
        view
        returns (string memory)
    {
        // to get profile detail for specific address
        return address_name_imgHash_bio[add][index];
    }
}
