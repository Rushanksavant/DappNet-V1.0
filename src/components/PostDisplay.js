import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react';

// import PostDetailed from './PostDetailed';
import Button_toModal from './Button';

import {
    PostAddress,
    ProfileAddress
} from '../config'

import Post from "../artifacts/contracts/Post.sol/Post.json";
import Profile from "../artifacts/contracts/Profile.sol/Profile.json";


export default function PostDisplay() {
    const [account, setAccount] = useState(null)
    const [Profile_img_hashUser, setProfile_img_hashUser] = useState('') // will be used to verify if user has profile or not

    const [allPosts, setAllPosts] = useState([])
    const [comment, setComment] = useState("")

    const [modalOn, setModalOn] = useState(false)

    useEffect(() => {
        getPostsInfo()

    }, [])

    // to connect user for liking/commenting functionalities
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
    async function getProfileImg() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

        const out = await Profile_contract.connect(account).getter(1)
        setProfile_img_hashUser(out)
    }
    getProfileImg()


    // to get all the information related to post
    async function getPostsInfo() {
        const abi = [
            'event postLiked(uint indexed id, address indexed liker, address author, string img_hash)',
            'event postLikeCancled(uint indexed id, address indexed likeCanceler, address author, string img_hash)'
        ]

        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const Post_contract = new ethers.Contract(PostAddress, Post.abi, provider)
        const Profile_contract = new ethers.Contract(ProfileAddress, Profile.abi, provider)

        let postDataCopy = [];

        const postData = await Post_contract.callStatic.getAllPosts()

        for (let i = 0; i < postData.length; i++) { // adding additional info

            if (postData[i].id.toNumber() !== 0) { // check if postId>0, if postId= 0 the post was deleted 

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

                // Query event logs using postId
                // const eventLike = Post_contract.filters.postLiked(postData[i].id, null, null, null)
                // const eventsLike = await Post_contract.queryFilter(eventLike)
                // const eventLikeCancel = Post_contract.filters.postLikeCancled(postData[i].id, null, null, null)
                // const eventsLikeCancel = await Post_contract.queryFilter(eventLikeCancel)

                // let likers = [eventsLike.map((_post) => {
                //     return (_post.args.liker)
                // })]
                // likers = likers[0]

                // let likerCanceler = [eventsLikeCancel.map((_post) => {
                //     return (_post.args.likeCanceler)
                // })]
                // likerCanceler = likerCanceler[0]
                // likers = likers.filter((_add) => !likerCanceler.includes(_add))

                // const like_poster = []
                // for (let _add = 0; _add < likers.length; _add++) {
                //     like_poster.push(await Profile_contract.getter_Address(likers[_add], 0))
                // }
                // console.log(like_poster)

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
    // console.log(allPosts)

    async function deletePost(id) { // delete post
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const Post_contract = new ethers.Contract(PostAddress, Post.abi, signer)
        await Post_contract.deletePost(id)
    }


    // Comments
    async function postComment(id, Acomment) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const Post_contract = new ethers.Contract(PostAddress, Post.abi, signer)
        await Post_contract.commentPost(id, Acomment)
    }
    async function deleteComment(id, Acomment) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const Post_contract = new ethers.Contract(PostAddress, Post.abi, signer)
        await Post_contract.deleteComment(id, Acomment)
    }


    // Likes
    async function likePost(id) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const Post_contract = new ethers.Contract(PostAddress, Post.abi, signer)
        await Post_contract.likePost(id)
    }
    async function cancleLike(id) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const Post_contract = new ethers.Contract(PostAddress, Post.abi, signer)
        await Post_contract.cancleLike(id)
    }


    return (
        <div className="w-4/12 mx-auto mt-5">
            <div className="py-3 px-3">

                {allPosts.map((post, i) =>

                ( // mapping all posts and creating their cards


                    <div className="h-full w-full mx-auto bg-black rounded-t-md rounded-b-lg border-4 border-indigo-600 flex flex-col mb-7">

                        <div className="py-3 w-full px-2 mx-auto bg-black text-indigo-500 flex">
                            <img src={post.Poster_img} className="h-10 w-10 rounded-full" />
                            <span className="font-semibold text-xl ml-5 my-auto">{post.Poster_name}</span>
                            <button onClick={() => { deletePost(post.id) }}
                                className='text-red-500 ml-auto mr-3 border-2 border-red-500 rounded-lg px-2 text-sm hover:bg-red-500 hover:bg-opacity-25'>
                                Delete</button>
                        </div>

                        <img src={post.img_hash} className="h-96 w-full p-1 px-3" />

                        <div className="mb-5 w-full px-4 py-2 mx-auto bg-black text-indigo-500">
                            <span className="font-semibold text-xl">{post.Poster_name}:</span> {post.description}
                        </div>

                        <div className="w-full px-5 mx-auto bg-black text-indigo-500 flex">

                            {account === null ? // connected?
                                (<div className='text-lg flex'>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>) :

                                Profile_img_hashUser === "" ? // user profile exist?
                                    (<div className='text-lg flex'>
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>) :

                                    (<div className='text-lg flex'>
                                        <button className='mb-3' onClick={() => { cancleLike(post.id) }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                                        </svg>
                                        <button className='mb-3' onClick={() => { likePost(post.id) }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-2 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    </div>)
                            }
                            <span className="text-2xl ml-5">{post.likes.toNumber()}</span>
                        </div>

                        <div className="h-10 w-full px-5 mx-auto bg-black text-indigo-500 flex mb-3 mt-2">
                            <input className="rounded-full h-2/3 w-9/12 mb-auto mr-auto border-indigo-800 border-4 p-5 text-lg bg-black text-white"
                                onChange={(event) => setComment(event.target.value)}></input>

                            {account === null ?
                                (<button className='h-10 bg-orange-500 text-white p-2 rounded-lg ml-auto'
                                    onClick={connect}>Connect</button>) :
                                Profile_img_hashUser === "" ?
                                    <p className='text-red-400 font-thin ml-2'>*You need to create Profile first, goto "Your Profile"</p> :
                                    (<button className='h-10 bg-indigo-500 text-white p-2 rounded-lg ml-auto'
                                        onClick={() => { postComment(post.id, comment) }}>Comment</button>)
                            }
                        </div>

                        <div className="w-full px-2 mx-auto bg-black text-indigo-500 mb-3 font-semibold text-xl">
                            Comments: {post.comments.toNumber()}
                        </div>


                        <div className='text-indigo-500 mb-3'>

                            {post.Comment_arr[0] === undefined ?
                                (<div>

                                </div>) :
                                post.Comment_arr[0] !== "nan" ?
                                    (<div className='flex flex-col'>
                                        <div className='flex pr-2 mt-auto'>
                                            <span className="font-semibold text-lg mx-2">{post.Comment_Poster[post.Comment_arr[0]]}:</span>
                                            <span className="font-normal text-lg">{post.Comment_arr[0]}</span>
                                        </div>
                                        <button onClick={() => { deleteComment(post.id, post.Comment_arr[0]) }} className="font-semibold text-sm text-red-600 hover:text-red-400 ml-auto mr-5">Delete</button>
                                    </div>) :
                                    (<div>
                                        <span className="font-normal text-md mt-auto ml-3 mb-3">/-----deleted comment-----\</span>
                                    </div>)
                            }
                        </div>

                        <div className='text-indigo-500 mb-2'>

                            {post.Comment_arr[1] === undefined ?
                                (<div>

                                </div>) :
                                post.Comment_arr[1] !== "nan" ?
                                    (<div className='flex flex-col'>
                                        <div className='flex pr-2 mt-auto'>
                                            <span className="font-semibold text-lg mx-2">{post.Comment_Poster[post.Comment_arr[1]]}: </span>
                                            <span className="font-normal text-lg">{post.Comment_arr[1]}</span>
                                        </div>
                                        <button onClick={() => { deleteComment(post.id, post.Comment_arr[1]) }} className="font-semibold text-sm text-red-600 hover:text-red-400 ml-auto mr-5 mb-3">Delete</button>
                                    </div>) :
                                    (<div>
                                        <span className="font-normal text-lg mt-auto">/-----deleted comment-----\</span>
                                    </div>)
                            }
                        </div>


                        <Button_toModal
                            profileName={post.Poster_name}
                            profileImg={post.Poster_img}

                            postId={post.id}
                            postImg={post.img_hash}
                            postDescription={post.description}

                            likesAddArr={post.Like_Poster}
                            likeNum={post.likes.toNumber()}

                            commentNum={post.comments.toNumber()}
                            commentsAddArr={post.Comment_Poster}
                            commentsArr={post.Comment_arr}
                        />


                    </div>
                ))}

            </div>

        </div >
    )
}