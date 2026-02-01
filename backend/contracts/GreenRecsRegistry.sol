// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract GreenRecsRegistry is ERC1155, Ownable {
    // TODO(1): declare events Issued(to,id,amount,uri) and Retired(from,id,amount,reason)
    
    event Issued(address indexed to, uint256 indexed id, uint256 amount, string uri);
    event Retired(address indexed from, uint256 indexed id, uint256 amount, string reason);
    // TODO(2): mapping tokenId => tokenURI (string)
    // mapping(uint256 => string) private _tokenUri;
    mapping(uint256 => string) private _tokenUri;
    // TODO(3): constructor: ERC1155("") + Ownable(msg.sender)
    constructor() ERC1155("") Ownable(msg.sender) {}

    function uri(uint256 id) public view override returns (string memory) {
        string memory tokenUri = _tokenUri[id];
        require(bytes(tokenUri).length > 0, "URI not set");
        return tokenUri;
    }

    function issue(
        address to,
        uint256 id,
        uint256 amount,
        string memory tokenUri
    ) public onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount is zero");

        if (bytes(_tokenUri[id]).length == 0) {
            require(bytes(tokenUri).length > 0, "URI required");
            _tokenUri[id] = tokenUri;
        }

        _mint(to, id, amount, "");
        emit Issued(to, id, amount, _tokenUri[id]);
    }

    function retire(
        uint256 id,
        uint256 amount,
        string memory reason
    ) public {
        require(amount > 0, "Amount is zero");

        _burn(msg.sender, id, amount);
        emit Retired(msg.sender, id, amount, reason);
    }
}

