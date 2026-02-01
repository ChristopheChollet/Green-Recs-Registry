import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("GreenRecsRegistry", function () {
  it("issues and retires RECs", async function () {
    const [owner, user] = await ethers.getSigners();

    const contract = await ethers.deployContract("GreenRecsRegistry");
    await contract.waitForDeployment();

    const tokenId = 1n;
    const amount = 10n;
    const retireAmount = 4n;
    const uri = "ipfs://example/rec-1.json";

    await expect(contract.issue(user.address, tokenId, amount, uri))
      .to.emit(contract, "Issued")
      .withArgs(user.address, tokenId, amount, uri);

    expect(await contract.balanceOf(user.address, tokenId)).to.equal(amount);
    expect(await contract.uri(tokenId)).to.equal(uri);

    await expect(contract.connect(user).retire(tokenId, retireAmount, "offset"))
      .to.emit(contract, "Retired")
      .withArgs(user.address, tokenId, retireAmount, "offset");

    expect(await contract.balanceOf(user.address, tokenId)).to.equal(6n);
  });
})