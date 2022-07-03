//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./MintNFT.sol";

/**
 * Writerコントラクト
 */
contract Writer {
    // デプロイする時のコスト
    uint256 private deploymentFee;
    /// writerコントラクトをデプロイ済みであるか確認するマップ
    mapping(address => bool) private hasWriterDeployed;
    /// writerコントラクトとデプロイするアドレスを紐づけるアドレス
    mapping(address => address) private writerDeployedContractAddress;

    /// デプロイしたWriterコントラクトを格納するための配列
    Writerr[] private writers;

    /// writerコントラクトに関する構造体の定義
    struct Writerr {
        // writerを書いた人のアドレス
        address writerAddress;
        // DID
        string writerDID;
        // writerを書いた人のアドレスとwrite
        address writerDeployedContractAddress;
    }

    // 各種イベントの定義
    event LogNewDeploymentFee(uint256 indexed newDeploymentFee);
    event LogNewDeployment(
        address indexed writerAddress,
        string indexed writerDID,
        address indexed writerDeployedContractAddress
    );

    /**
     * 資金を受け取るための関数
     */
    receive() external payable {}

    /**
     * コンストラクター
     * @param _deploymentFee 発行時のコスト
     */
    constructor(uint256 _deploymentFee) {
        deploymentFee = _deploymentFee;
    }

    /**
     * コントラクトの残高を取得するメソッド
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * 既にデプロイ済みか確認するためのメソッド
     */
    function getHasWriterDeployed(address _address) public view returns (bool) {
        require(_address != address(0), "Invalid address.");
        return hasWriterDeployed[_address];
    }

    /**
     * 呼び出し元のアドレスが書いたwriterコントラクトのアドレスを取得するメソッド
     */
    function getWriterDeployedContractAddress(address _address)
        public
        view
        returns (address)
    {
        require(_address != address(0), "Invalid address.");
        return writerDeployedContractAddress[_address];
    }

    /**
     * writerコントラクトの配列を取得するメソッド
     */
    function getWriters() public view returns (Writerr[] memory) {
        return writers;
    }

    /**
     * コスト情報を後から更新するメソッド
     */
    function setDeploymentFee(uint256 _newDeploymentFee) public {
        deploymentFee = _newDeploymentFee;
        emit LogNewDeploymentFee(_newDeploymentFee);
    }

    /**
     * NFTを発行するメソッド
     * @param _did DID
     */
    function deployWriterNFT(string memory _did) public payable {
        require(msg.sender != address(0), "Invalid address.");
        require(
            hasWriterDeployed[msg.sender] == false,
            "Contract already deployed by this address."
        );

        // NFTコントラクトを作成する。
        MintNFT nft = new MintNFT();
        // NFTのアドレスを取得する。
        address deployedContractAddress = address(nft);
        // writersに格納する。
        writers.push(Writerr(msg.sender, _did, deployedContractAddress));
        // mappingを生成する。
        writerDeployedContractAddress[msg.sender] = deployedContractAddress;
        // デプロイ済みのフラグをオンにする。
        hasWriterDeployed[msg.sender] = true;
        // イベントを発行する。
        emit LogNewDeployment(msg.sender, _did, deployedContractAddress);
    }
}
