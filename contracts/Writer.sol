//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

/**
 * Writerコントラクト
 */
contract Writer {
    uint256 private deploymentFee;

    /// Returns true if the writer has already deployed a contract
    mapping(address => bool) private hasWriterDeployed;

    /// Returns the address of the contract deployed by the writer
    mapping(address => address) private writerDeployedContractAddress;

    /// List of all the writers who has depolyed their contract
    Writerr[] private writers;

    /// @notice Defines a writer by their wallet address, decentralized identity id(DID) and the address of the contract they deployed
    struct Writerr {
        address writerAddress;
        string writerDID;
        address writerDeployedContractAddress;
    }

    event LogNewDeploymentFee(uint256 indexed newDeploymentFee);

    event LogNewDeployment(
        address indexed writerAddress,
        string indexed writerDID,
        address indexed writerDeployedContractAddress
    );

    /// @dev Required to receive funds to this contract
    receive() external payable {}

    constructor(uint256 _deploymentFee, address _owner) {
        deploymentFee = _deploymentFee;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getDeploymentFee() public view returns (uint256) {
        return deploymentFee;
    }

    function getHasWriterDeployed(address _address) public view returns (bool) {
        require(_address != address(0), "Invalid address.");
        return hasWriterDeployed[_address];
    }

    function getWriterDeployedContractAddress(address _address)
        public
        view
        returns (address)
    {
        require(_address != address(0), "Invalid address.");
        return writerDeployedContractAddress[_address];
    }

    function getWriters() public view returns (Writerr[] memory) {
        return writers;
    }

    function setDeploymentFee(uint256 _newDeploymentFee) public {
        deploymentFee = _newDeploymentFee;
        emit LogNewDeploymentFee(_newDeploymentFee);
    }

    function deployWriterERC20Contract(
        string memory _did,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _tokenPrice,
        uint256 _initialMintTokenAmount
    ) public payable {
        require(msg.sender != address(0), "Invalid address.");
        require(
            hasWriterDeployed[msg.sender] == false,
            "Contract already deployed by this address."
        );
        require(msg.value == deploymentFee, "Pay deployment fee.");
        // ここはNFTに変更する？？
        /*
        WriterERC20 writerERC20 = new WriterERC20(
            _tokenName,
            _tokenSymbol,
            _tokenPrice,
            _initialMintTokenAmount,
            msg.sender
        );*/
        address deployedContractAddress = address(writerERC20);
        writers.push(Writerr(msg.sender, _did, deployedContractAddress));
        writerDeployedContractAddress[msg.sender] = deployedContractAddress;
        hasWriterDeployed[msg.sender] = true;
        emit LogNewDeployment(msg.sender, _did, deployedContractAddress);
    }
}
