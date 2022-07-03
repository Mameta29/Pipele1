// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

/**
 * MintNFTコントラクト
 * ERC721URIStorageを継承する。
 */
contract MintNFT is ERC721URIStorage {
    // カウンター用の定義
    using Counters for Counters.Counter;
    // トークンID用の変数
    Counters.Counter private _tokenIds;
    // ower用のアドレス
    address owner;

    /**
     * コンストラクター
     * NFT名 PipeleNFT
     * シンボル名 PPFT
     */
    constructor() ERC721("PipeleNFT", "PPFT") {
        owner = msg.sender;
    }

    /**
     * NFTを発行するメソッド
     * @param to 発行先のアドレス
     */
    function mint(address to) public returns (uint256) {
        require(owner == msg.sender, "Only owner can mint NFT");
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(to, newTokenId);
        return newTokenId;
    }
}
