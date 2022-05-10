import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { useState } from "react";
import { create } from 'ipfs-http-client'

import Background from "./components/Background";
import Navbar from "./components/Navbar";
import CreatePost from "./components/CreatePost";
import PostDisplay from "./components/PostDisplay";
import BackToTop from "./components/BackToTop";

import {
  ProfileAddress,
  PostAddress
} from './config'

import Profile from "./artifacts/contracts/Profile.sol/Profile.json";
import Post from "./artifacts/contracts/Post.sol/Post.json";


function App() {
  // connect user profile
  // create post
  // display post

  const [modalOn, setModalOn] = useState(false)

  return (
    <div className="bg-gray-900 h-screen overflow-auto">

      <Navbar />

      <CreatePost />
      <PostDisplay />
      <Background />
      <BackToTop loc="/" />

    </div>
  );
}

export default App;
