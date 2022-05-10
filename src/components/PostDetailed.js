import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react';

import {
    PostAddress,
    ProfileAddress
} from '../config'

import Post from "../artifacts/contracts/Post.sol/Post.json";
import Profile from "../artifacts/contracts/Profile.sol/Profile.json";

export default function PostDetailed(props) {

    async function deleteComment(id, Acomment) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const Post_contract = new ethers.Contract(PostAddress, Post.abi, signer)
        await Post_contract.deleteComment(id, Acomment)
    }

    return (
        <div className="bg-black bg-opacity-90 fixed inset-0 z-50">
            <button className='absolute right-10 top-10' onClick={() => { props.setModalOn(false) }}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-500 hover:text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="flex justify-center items-center h-screen">

                <div className="flex-col justify-center  bg-black h-3/4 w-2/3 border-4 border-indigo-500 rounded-lg max-w-1/2 overflow-y-auto">

                    <div className="py-10 px-10 w-full mx-auto bg-black text-indigo-500 flex">
                        <img src={props.profileImg} className="h-20 w-20 rounded-full" />
                        <span className="font-semibold text-4xl ml-5 my-auto">{props.profileName}</span>
                    </div>

                    <div className='flex justify-between mx-7 h-10/12'>
                        <img src={props.postImg} className="h-1/2 p-1 px-3 w-2/6" />
                        <span className="font-semibold text-xl text-indigo-500">Description: {props.postDescription}</span>
                    </div>


                    <div className='flex justify-between mx-4 text-indigo-500 mt-10 mb-2'>

                        <div className='mr-auto w-1/3 overflow-y-auto'>
                            <div className='mr-auto text-3xl mb-2'> <span className='underline'>Likes </span> - {props.likeNum}</div>
                            <div className='flex flex-col'>
                                {props.likesAddArr.map((add) => (
                                    <div>
                                        <span className='text-indigo-500 text-lg ml-2'>{add}</span>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className='mr-auto overflow-y-auto mb-2'>
                            <div className='text-3xl mb-2'> <span className='underline'>Comments </span> - {props.commentNum}</div>
                            <div className='flex flex-col'>
                                {props.commentsArr.map((comm) => (
                                    <div className='flex'>

                                        {comm === "nan" ?
                                            (<div className='text-indigo-500 text-lg ml-2'>
                                                /-----deleted comment-----\
                                            </div>) :

                                            (<div>

                                                <span className='text-indigo-500 font-bold text-lg'>{props.commentsAddArr[comm]}: </span>
                                                <span className='text-indigo-500 text-lg ml-2'>{comm}</span>

                                                <button className='text-sm text-red-500 hover:text-red-700 ml-5'
                                                    onClick={() => { deleteComment(props.postId, comm) }}>Delete</button>
                                            </div>)}

                                    </div>))}
                            </div>
                        </div>

                    </div>


                </div>
            </div>
        </div >
    )
}