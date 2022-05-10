const hre = require("hardhat");
const fs = require('fs');

async function main() {

  // We get the contract to deploy
  const Post = await hre.ethers.getContractFactory("Post");
  const post = await Post.deploy();
  await post.deployed();

  const Profile = await hre.ethers.getContractFactory("Profile");
  const profile = await Profile.deploy();
  await profile.deployed();

  console.log("Post.sol deployed to:", post.address);
  console.log("Profile.sol deployed to:", profile.address);

  fs.writeFileSync('./src/config.js', `
  export const PostAddress = "${post.address}"
  export const ProfileAddress = "${profile.address}"
  `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
