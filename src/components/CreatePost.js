import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { useState } from 'react';
import { create } from 'ipfs-http-client'


import {
    PostAddress,
    ProfileAddress
} from '../config'

import Post from "../artifacts/contracts/Post.sol/Post.json";
import Profile from "../artifacts/contracts/Profile.sol/Profile.json";


export default function CreatePost() {

    const [account, setAccount] = useState(null)
    const [fileUrl, setFileUrl] = useState('')
    const [description, setDescription] = useState('')
    const [Profile_img_hash, setProfile_img_hash] = useState("") // user will be allowed to post only if he has profileimg

    // contracts
    let Post_contract
    let Profile_contract


    async function connect() {
        try {
            // connecting...
            const web3Modal = new Web3Modal()
            const connection = await web3Modal.connect()
            const provider = new ethers.providers.Web3Provider(connection)
            const accounts = await provider.listAccounts()
            setAccount(accounts[0]) // saving account address

            // contract pointers
            Post_contract = new ethers.Contract(PostAddress, Post.abi, provider)
            Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

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
            setFileUrl(url)

        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function post() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        // const accounts = await provider.listAccounts()

        Post_contract = new ethers.Contract(PostAddress, Post.abi, signer)
        const transaction = await Post_contract.createPost(description, fileUrl)

        await transaction.wait()
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

    return (
        <div className="lg:w-2/5 lg:h-2/5 bg-gray-300 bg-opacity-50 mx-auto mt-3 rounded-xl md:h-1/5 md:w-1/2 sm:h-1/6 sm:w-1/2 relative">
            <div className="h-2/6 flex">
                {account == null ?
                    (<img src=""
                        className="rounded-full justify start bg-white h-full w-2/12 m-2 p-1 border-indigo-800 border-4" alt="Profile" />) :
                    (<img src={Profile_img_hash}
                        className="rounded-full justify start bg-white h-full w-2/12 m-2 p-1 border-indigo-800 border-4" alt="Profile" />)}

                <input className="rounded-full h-2/3 w-9/12 mx-auto my-auto border-indigo-800 border-4 p-5 text-2xl bg-gray-200"
                    title="Share something?"
                    onChange={(event) => setDescription(event.target.value)}></input>
            </div>


            <div className='mt-4 flex'>
                <button className="relative bg-indigo-600 h-1/5 p-3 rounded-xl text-white text-2xl font-bold ml-3 hover:bg-indigo-500 flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Media
                    <input className='left-0 opacity-0 absolute' type="file" onChange={upload} />
                </button>

                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white ml-3 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>

            </div>


            {account == null ?
                (<div className='mt-10'>
                    <button onClick={connect} className="ml-auto mr-2 bg-orange-500 h-1/5 w-3/12 p-3 rounded-full text-white text-2xl font-bold hover:border-4 hover:border-orange-800 flex">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                        </svg>
                        Connect
                    </button>

                </div>) :
                Profile_img_hash !== "" ?
                    (<div className='mt-10'>
                        <div onClick={post} className="ml-auto mr-2 bg-indigo-500 h-1/5 w-2/12 p-3 rounded-full text-white text-2xl font-bold hover:border-4 hover:border-indigo-800 flex">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                            Post
                        </div>
                    </div>) :
                    <div className='mt-10'>
                        <button onClick={connect} className="ml-auto mr-2 bg-orange-500 h-1/5 w-3/12 p-3 rounded-full text-white text-2xl font-bold hover:border-4 hover:border-orange-800 flex">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                            </svg>
                            Connect
                        </button>
                        <p className='text-red-400 font-thin ml-2'>*You need to create Profile first, goto "Your Profile"</p>
                    </div>
            }
            {
                fileUrl && (
                    <img src={fileUrl} width="100px" className='absolute bottom-1 left-5 mt-1' />
                )
            }

        </div >
    )
}