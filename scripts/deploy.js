const { ethers } = require("hardhat");

async function main() {
  const Calucator = await ethers.deployContract("LandMarketplace");
  await Calucator.waitForDeployment();

  console.log("Calucator deployed to:", await Calucator.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });