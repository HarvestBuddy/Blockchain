// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LandMarketplace {
    struct Land {
        uint256 id;
        address owner;
        string details;
        uint256 price;

        bool forSale;
    }

    uint256 public nextLandId;
    mapping(uint256 => Land) public lands;
    mapping(address => uint256[]) public ownerLandIds;

    event LandRegistered(uint256 id, address indexed owner, string details);
    event LandListed(uint256 id, uint256 price);
    event LandSold(uint256 id, address indexed newOwner);

    modifier onlyOwner(uint256 _landId) {
        require(lands[_landId].owner == msg.sender, "Only the owner can call this function");
        _;
    }

    
    modifier isForSale(uint256 _landId) {
        require(lands[_landId].forSale, "Land is not for sale");
        _;
    }

    modifier isNotOwner(uint256 _landId) {
        require(lands[_landId].owner != msg.sender, "You already own this land");
        _;
    }

    function registerLand(string memory _details) external {
        lands[nextLandId] = Land(nextLandId, msg.sender, _details, 0, false);
        ownerLandIds[msg.sender].push(nextLandId);
        emit LandRegistered(nextLandId, msg.sender, _details);
        nextLandId++;
    }

    function sell(uint256 _landId, uint256 _price) external onlyOwner(_landId) {
        lands[_landId].price = _price;
        lands[_landId].forSale = true;
        emit LandListed(_landId, _price);
    }

    function buy(uint256 _landId) external payable isForSale(_landId) isNotOwner(_landId) {
        Land storage land = lands[_landId];
        require(msg.value == land.price, "Incorrect value sent");

        payable(land.owner).transfer(msg.value);

        land.owner = msg.sender;
        land.forSale = false;

        ownerLandIds[msg.sender].push(_landId);

        emit LandSold(_landId, msg.sender);
    }

    function getLandData(uint256 _landId) external view returns (address, string memory, uint256, bool) {
        Land memory land = lands[_landId];
        return (land.owner, land.details, land.price, land.forSale);
    }

    function getLands(address _owner) external view returns (uint256[] memory) {
        return ownerLandIds[_owner];
    }
}
