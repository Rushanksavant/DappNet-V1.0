import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react';

import {
    PostAddress,
    ProfileAddress
} from '../config'

import Post from "../artifacts/contracts/Post.sol/Post.json";
import Profile from "../artifacts/contracts/Profile.sol/Profile.json";

export default function UserActivity() {

    const [account, setAccount] = useState(null)

    const [postActivity, setPostActivity] = useState(false)
    const [likeActivity, setLikeActivity] = useState(false)
    const [commentActivity, setCommentActivity] = useState(false)

    const [postCreated, setPostCreated] = useState([])
    const [postDeleted, setPostDeleted] = useState([])

    const [postLiked, setPostLiked] = useState([])
    const [postLikeCancled, setPostLikeCancled] = useState([])

    const [commentPosted, setCommentPosted] = useState([])
    const [commentDeleted, setCommentDeleted] = useState([])



    async function connect() {
        try {
            // connecting...
            const web3Modal = new Web3Modal()
            const connection = await web3Modal.connect()
            const provider = new ethers.providers.Web3Provider(connection)
            const accounts = await provider.listAccounts()
            setAccount(accounts[0]) // saving account address
        } catch (err) {
            console.log('error:', err)
        }
    }

    async function PostCreated() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)

        const abi = [
            'event postCreated(uint256 indexed id, string description, string img_hash, address indexed author)'
        ]
        const Post_contract = new ethers.Contract(PostAddress, abi, provider)

        const eventFilter = Post_contract.filters.postCreated(null, null, null, account)
        const events = await Post_contract.connect(account).queryFilter(eventFilter)
        setPostCreated(events)
    }

    async function PostDeleted() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)

        const abi = [
            'event postDeleted(uint256 indexed id, string description, string img_hash, address indexed deleteor)'
        ]

        const Post_contract = new ethers.Contract(PostAddress, abi, provider)

        const eventFilter = Post_contract.filters.postDeleted(null, null, null, account)
        const events = await Post_contract.connect(account).queryFilter(eventFilter)
        setPostDeleted(events)
    }

    async function PostLiked() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)

        const abi = [
            'event postLiked(uint indexed id, address indexed liker, address author, string img_hash)'
        ]

        const Post_contract = new ethers.Contract(PostAddress, abi, provider)
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

        const eventFilter = Post_contract.filters.postLiked(null, account, null, null)
        const events = await Post_contract.connect(account).queryFilter(eventFilter)

        const output = [] // to store author name as well
        for (let i = 0; i < events.length; i++) {
            const authorName = await Profile_contract.getter_Address(events[i].args.author, 0)
            output.push({
                ...events[i].args,
                "Author_name": authorName
            })
        }
        setPostLiked(output)
    }
    async function PostLikedCancled() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)

        const abi = [
            'event postLikeCancled(uint indexed id, address indexed likeCanceler, address author, string img_hash)'
        ]

        const Post_contract = new ethers.Contract(PostAddress, abi, provider)
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

        const eventFilter = Post_contract.filters.postLikeCancled(null, account, null, null)
        const events = await Post_contract.connect(account).queryFilter(eventFilter)

        const output = [] // to store author name as well
        for (let i = 0; i < events.length; i++) {
            const authorName = await Profile_contract.getter_Address(events[i].args.author, 0)
            output.push({
                ...events[i].args,
                "Author_name": authorName
            })
        }
        setPostLikeCancled(output)
    }

    async function CommentPosted() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)

        const abi = [
            'event commented(uint indexed id, address indexed commentPoster, string comment, address author, string img_hash)'
        ]

        const Post_contract = new ethers.Contract(PostAddress, abi, provider)
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

        const eventFilter = Post_contract.filters.commented(null, account, null, null, null)
        const events = await Post_contract.connect(account).queryFilter(eventFilter)

        const output = [] // to store author name as well
        for (let i = 0; i < events.length; i++) {
            const authorName = await Profile_contract.getter_Address(events[i].args.author, 0)
            output.push({
                ...events[i].args,
                "Author_name": authorName
            })
        }
        setCommentPosted(output)
    }
    async function CommentDeleted() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)

        const abi = [
            'event commentDeleted(uint indexed id, address indexed commentDeletor, string comment, address author, string img_hash)'
        ]

        const Post_contract = new ethers.Contract(PostAddress, abi, provider)
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

        const eventFilter = Post_contract.filters.commentDeleted(null, account, null, null, null)
        const events = await Post_contract.connect(account).queryFilter(eventFilter)

        const output = [] // to store author name as well
        for (let i = 0; i < events.length; i++) {
            const authorName = await Profile_contract.getter_Address(events[i].args.author, 0)
            output.push({
                ...events[i].args,
                "Author_name": authorName
            })
        }
        setCommentDeleted(output)
    }



    return (
        <div>
            {account == null ? // if not connected, show connect button, else show user profile/profile registration
                (<div className='mt-10'>
                    <button onClick={connect} className="ml-auto mr-2 bg-orange-500 h-1/5 w-3/12 p-3 rounded-full text-white text-2xl font-bold hover:border-4 hover:border-orange-800 flex">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                        </svg>
                        Connect
                    </button>
                </div>) :
                (<div className='flex flex-col items-center h-screen text-indigo-500'>
                    <div className='flex mt-5 w-1/2 justify-between'>
                        <button className='bg-indigo-500 rounded-lg p-3 text-white'
                            onClick={() => {
                                setPostActivity(true)
                                setLikeActivity(false)
                                setCommentActivity(false)
                                PostCreated()
                                PostDeleted()
                            }}>Post Activity</button>

                        <button className='bg-indigo-500 rounded-lg p-3 text-white'
                            onClick={() => {
                                setPostActivity(false)
                                setLikeActivity(true)
                                setCommentActivity(false)
                                PostLiked()
                                PostLikedCancled()
                            }}>Like Activity</button>

                        <button className='bg-indigo-500 rounded-lg p-3 text-white'
                            onClick={() => {
                                setPostActivity(false)
                                setLikeActivity(false)
                                setCommentActivity(true)
                                CommentPosted()
                                CommentDeleted()
                            }}>Comment Activity</button>
                    </div>

                    {/* Post related events */}

                    {postActivity ?
                        (<div className='flex w-full'>
                            <div className='w-1/2 ml-10 mt-10 bg-black border-indigo-800 border-4 rounded-lg p-5'>
                                <span className='text-3xl font-semibold'>Post Created</span>
                                <div className='mt-3'>
                                    {postCreated.map((_post) => (
                                        <div className='flex flex-col text-lg mb-5 bg-gray-900 p-2 rounded-lg'>
                                            <p>You created a post:</p>
                                            <div className='flex mt-2'>
                                                <img src={_post.args.img_hash} className='h-24 w-24 border-indigo-500 border-2' />
                                                <p className='my-auto ml-3'>Description: {_post.args.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='w-1/2 ml-10 mt-10 bg-black border-indigo-800 border-4 rounded-lg p-5 mr-10'>
                                <span className='text-3xl font-semibold'>Post Deleted</span>
                                <div className='mt-3'>
                                    {postDeleted.map((_post) => (
                                        <div className='flex flex-col text-lg mb-5 bg-gray-900 p-2 rounded-lg'>
                                            <p>You deleted post:</p>
                                            <div className='flex mt-2'>
                                                <img src={_post.args.img_hash} className='h-24 w-24 border-indigo-500 border-2' />
                                                <p className='my-auto ml-3'>Description: {_post.args.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>) :
                        (<div></div>)}


                    {/* Like related events */}
                    {likeActivity ?
                        (<div className='flex w-full'>

                            <div className='w-1/2 ml-10 mt-10 bg-black border-indigo-800 border-4 rounded-lg p-5'>
                                <span className='text-3xl font-semibold'>Post Liked</span>
                                <div className='mt-3'>
                                    {postLiked.map((_post) => (
                                        <div className='flex flex-col text-lg mb-5 bg-gray-900 p-2 rounded-lg'>
                                            <p>You Liked:</p>
                                            <div className='flex mt-2'>
                                                <p className='my-auto ml-3 mr-3'>{_post.Author_name} :</p>
                                                <img src={_post.img_hash} className='h-24 w-24 border-indigo-500 border-2' />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='w-1/2 ml-10 mt-10 bg-black border-indigo-800 border-4 rounded-lg p-5 mr-10'>
                                <span className='text-3xl font-semibold'>Post Like Cancelled</span>
                                <div className='mt-3'>
                                    {postLikeCancled.map((_post) => (
                                        <div className='flex flex-col text-lg mb-5 bg-gray-900 p-2 rounded-lg'>
                                            <p>You Canceled Like:</p>
                                            <div className='flex mt-2'>
                                                <p className='my-auto ml-3 mr-3'>{_post.Author_name}:</p>
                                                <img src={_post.img_hash} className='h-24 w-24 border-indigo-500 border-2' />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>) :
                        (<div></div>)}


                    {/* Comment related events */}
                    {commentActivity ?
                        (<div className='flex w-full'>

                            <div className='w-1/2 ml-10 mt-10 bg-black border-indigo-800 border-4 rounded-lg p-5'>
                                <span className='text-3xl font-semibold'>Post Commented</span>
                                <div className='mt-3'>
                                    {commentPosted.map((_post) => (
                                        <div className='flex flex-col text-lg mb-5 bg-gray-900 p-2 rounded-lg'>
                                            <p>You Commented: {_post.comment}</p>
                                            <div className='flex mt-2'>
                                                <p className='my-auto ml-3 mr-3'>{_post.Author_name}:</p>
                                                <img src={_post.img_hash} className='h-24 w-24 border-indigo-500 border-2' />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='w-1/2 ml-10 mt-10 bg-black border-indigo-800 border-4 rounded-lg p-5 mr-10'>
                                <span className='text-3xl font-semibold'>Post Comment Deleted</span>
                                <div className='mt-3'>
                                    {commentDeleted.map((_post) => (
                                        <div className='flex flex-col text-lg mb-5 bg-gray-900 p-2 rounded-lg'>
                                            <p>You Commented: {_post.comment}</p>
                                            <div className='flex mt-2'>
                                                <p className='my-auto ml-3 mr-3'>{_post.Author_name}:</p>
                                                <img src={_post.img_hash} className='h-24 w-24 border-indigo-500 border-2' />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>) :
                        (<div></div>)}

                </div>)}
        </div>
    )
} 