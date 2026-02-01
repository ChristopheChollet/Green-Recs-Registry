const { ethers } = await network.connect();

const registry = await ethers.getContractAt(
  "GreenRecsRegistry",
  "0x5FbDB2315678afecb367f032d93F642f64180aa3"
);

const [owner, user] = await ethers.getSigners();

await registry.issue(user.address, 1n, 500n, "ipfs://rec-001.json");
await registry.issue(user.address, 2n, 300n, "ipfs://rec-002.json");
await registry.connect(user).retire(1n, 120n, "offset");