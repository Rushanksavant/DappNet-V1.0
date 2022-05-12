import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { useState } from "react";
import { create } from 'ipfs-http-client'

import Background from "../components/Background";
import Navbar from "../components/Navbar";
import BackToTop from "../components/BackToTop";
import PostDisplayProfile from '../components/PostDisplayProfile';

import {
    PostAddress,
    ProfileAddress
} from '../config'

import Post from "../artifacts/contracts/Post.sol/Post.json";
import Profile from "../artifacts/contracts/Profile.sol/Profile.json";


export default function ProfilePage() {

    const [account, setAccount] = useState(null)
    const [name, setName] = useState("")
    const [fileURL, setFileURL] = useState("")
    const [bio, setBio] = useState("")

    const [Profile_name, setProfile_name] = useState("")
    const [Profile_img_hash, setProfile_img_hash] = useState("")
    const [Profile_bio, setProfile_bio] = useState("")

    const [allPosts, setAllPosts] = useState([])


    async function connect() {
        try {
            // connecting...
            const web3Modal = new Web3Modal()
            const connection = await web3Modal.connect()
            const provider = new ethers.providers.Web3Provider(connection)
            const accounts = await provider.listAccounts()
            setAccount(accounts[0]) // saving account address

            // contract pointers
            const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

            // Profile pointers
            Profile_name = await Profile_contract.getter(0)
            Profile_img_hash = await Profile_contract.getter(1)
            Profile_bio = await Profile_contract.getter(2)


        } catch (err) {
            console.log('error:', err)
        }
    }

    async function upload(e) {
        const client = create('https://ipfs.infura.io:5001/api/v0')
        const file = e.target.files[0]

        try {
            const added = await client.add(file)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileURL(url)

        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function updateName() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, signer)

        let tx = await Profile_contract.updateName(name)
        console.log(tx.hash);
        await tx.wait();

        Profile_name = await Profile_contract.getter(0);
        console.log(Profile_name)
    }

    async function updateImage() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, signer)

        await Profile_contract.updateImg(fileURL)
        Profile_img_hash = await Profile_contract.getter(1)
        console.log(Profile_img_hash)
    }

    async function updateBio() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, signer)

        await Profile_contract.updateBio(bio)
        Profile_bio = await Profile_contract.getter(2)
        console.log(Profile_bio)
    }

    async function getProfileName() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

        const out = await Profile_contract.connect(account).getter(0)
        setProfile_name(out)
    }
    getProfileName()
    // console.log(Profile_name)

    // to get all the information related to post
    async function getPostsInfo() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const Post_contract = new ethers.Contract(PostAddress, Post.abi, provider)
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

        let postDataCopy = [];

        const postData = await Post_contract.callStatic.getAllPosts()

        for (let i = 0; i < postData.length; i++) { // adding additional info

            if (postData[i].id.toNumber() !== 0 && postData[i].author === account) { // check if postId>0, if postId= 0 the post was deleted 

                const name = await Profile_contract.getter_Address(postData[i].author, 0) // Profile name of the poster
                const img = await Profile_contract.getter_Address(postData[i].author, 1) // Profile img of the poster
                const comments = await Post_contract.getCommentsPost(postData[i].id) // comments on the post

                const comment_poster = {}
                for (let _commIndex = 0; _commIndex < comments.length; _commIndex++) {
                    const posterAdd = await Post_contract.getCommentPoster(postData[i].id, comments[_commIndex])
                    const posterName = await Profile_contract.getter_Address(posterAdd, 0)
                    comment_poster[comments[_commIndex]] = posterName
                }

                const likedAdds = await Post_contract.idLikedAddresses(postData[i].id)
                const like_poster = []
                for (let _add = 0; _add < likedAdds.length; _add++) {
                    like_poster.push(await Profile_contract.getter_Address(likedAdds[_add], 0))
                }

                postDataCopy.push({
                    ...postData[i], // all data from original postData
                    "Poster_name": name,
                    "Poster_img": img,
                    "Comment_arr": comments,
                    "Comment_Poster": comment_poster,
                    "Like_Poster": like_poster
                }) // postData has un-extenable objects, hence creating copy and adding new properties
            }
        }
        setAllPosts(postDataCopy)
    }

    async function getProfileImg() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

        const out = await Profile_contract.connect(account).getter(1)
        setProfile_img_hash(out)
    }
    getProfileImg()
    // console.log(Profile_img_hash)

    async function getProfileBio() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

        const out = await Profile_contract.connect(account).getter(2)
        setProfile_bio(out)
    }
    getProfileBio()
    // console.log(Profile_bio)

    return (
        <div className="bg-gray-900 h-screen overflow-auto">

            <Navbar />


            {account == null ? // if not connected, show connect button, else show user profile/profile registration 
                (<div className='mt-10'>
                    <button onClick={connect} className="ml-auto mr-2 bg-orange-500 h-1/5 w-3/12 p-3 rounded-full text-white text-2xl font-bold hover:border-4 hover:border-orange-800 flex">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                        </svg>
                        Connect
                    </button>
                </div>) :

                Profile_name && Profile_img_hash && Profile_bio ? // if true, then show user profile, else ask to register
                    (<div className='mt-10 mx-10'>
                        <div className='flex flex-col w-full'>
                            <p className='mx-auto mt-10 text-white font-serif text-4xl font-semibold'>{Profile_name}</p>
                            <img src={Profile_img_hash}
                                className="rounded-full justify start bg-white h-36 w-36 m-2 p-1 border-indigo-800 border-4 mx-auto" alt="Profile" />
                            <p className='mx-auto mt-10 text-white font-serif text-2xl font-semibold'>{Profile_bio}</p>
                        </div>
                        <button onClick={getPostsInfo}
                            className='bg-indigo-500 p-3 rounded-lg hover:bg-indigo-600 text-white font-semibold mt-3 hover:border-4 hover:border-indigo-800'>Your posts:</button>
                    </div>) :
                    (<div className='mt-10 mx-10 '>
                        <div className='flex justify-start'>
                            <p className='text-2xl text-white my-1 mr-3'>Name:</p>
                            <input className="rounded-full h-10 w-96 border-indigo-800 border-4 p-5 text-2xl bg-gray-200"
                                onChange={(event) => setName(event.target.value)}></input> <br></br>
                            <button className='bg-indigo-600 h-10 px-2 rounded-xl text-white text-lg font-bold ml-3 hover:bg-indigo-500'
                                onClick={updateName}>Update Name</button>
                        </div>

                        <div className='flex justify-start mt-3'>
                            <p className='text-2xl text-white my-1 mr-3 ml-7'>Bio:</p>
                            <input className="rounded-full h-10 w-96 border-indigo-800 border-4 p-5 text-2xl bg-gray-200"
                                onChange={(event) => setBio(event.target.value)}></input> <br></br>
                            <button className='bg-indigo-600 h-10 px-2 rounded-xl text-white text-lg font-bold ml-3 hover:bg-indigo-500'
                                onClick={updateBio}>Update Bio</button>
                        </div>

                        <div className='flex mt-5'>
                            <button className="relative bg-indigo-600 h-1/5 p-3 rounded-xl text-white text-2xl font-bold ml-3 hover:bg-indigo-500 flex">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Profile Image
                                <input className='left-0 opacity-0 absolute' type="file" onChange={upload} />
                            </button>

                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white ml-3 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {
                                fileURL && (
                                    <div className='flex'>
                                        <img src={fileURL} width="250px" className='ml-10' />
                                        <button className='bottom-40 bg-indigo-600 h-10 px-2 rounded-xl text-white text-lg font-bold ml-3 hover:bg-indigo-500'
                                            onClick={updateImage}>Update Image</button>
                                    </div>
                                )
                            }
                        </div>
                    </div>)}

            <PostDisplayProfile acc={account} allPosts={allPosts} />
            <Background />
            <BackToTop loc="profile" />

        </div>
    );
}
