import { network } from "hardhat";

const { ethers } = await network.connect();

const contract = await ethers.deployContract("GreenRecsRegistry");
await contract.waitForDeployment();

console.log("GreenRecsRegistry deployed to:", await contract.getAddress());
