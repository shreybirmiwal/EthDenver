import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", await deployer.getAddress());

  const InsuranceClaims = await ethers.getContractFactory("InsuranceClaims");
  const insuranceClaims = await InsuranceClaims.deploy();

  await insuranceClaims.deployed();
  console.log("InsuranceClaims deployed to:", insuranceClaims.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
