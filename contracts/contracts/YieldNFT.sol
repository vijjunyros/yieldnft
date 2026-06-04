// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract YieldNFT {
  struct Token { address owner; string uri; uint256 mintedAt; }
  mapping(uint256 => Token) public tokens;
  mapping(address => uint256[]) private _owned;
  uint256 public totalSupply;
  uint256 public mintPrice;
  address public owner;
  event Minted(uint256 indexed id, address indexed to);
  constructor() { owner = msg.sender; mintPrice = 0.001 ether; }
  function mint(string calldata uri) external payable returns (uint256) {
    require(msg.value >= mintPrice, "insufficient");
    uint256 id = totalSupply++;
    tokens[id] = Token(msg.sender, uri, block.timestamp);
    _owned[msg.sender].push(id);
    emit Minted(id, msg.sender);
    return id;
  }
  function getOwned(address user) external view returns (uint256[] memory) { return _owned[user]; }
  function getToken(uint256 id) external view returns (address, string memory, uint256) {
    Token storage t = tokens[id]; return (t.owner, t.uri, t.mintedAt);
  }
  function setPrice(uint256 p) external { require(msg.sender == owner); mintPrice = p; }
  function withdraw() external { require(msg.sender == owner); payable(owner).transfer(address(this).balance); }
}