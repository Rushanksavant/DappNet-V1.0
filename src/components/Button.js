import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react';

import PostDetailed from './PostDetailed';

export default function Button_toModal(props) {
    const [modalOn, setModalOn] = useState(false)

    return (
        <div>
            <button className="font-extrathin text-md hover:text-white mb-3 ml-auto mr-5 text-indigo-500"
                onClick={() => { setModalOn(true) }}>
                more....
            </button>

            {
                modalOn && <PostDetailed
                    setModalOn={setModalOn} // to close modal

                    profileName={props.profileName}
                    profileImg={props.profileImg}

                    postId={props.postId}
                    postImg={props.postImg}
                    postDescription={props.postDescription}

                    likesAddArr={props.likesAddArr}
                    likeNum={props.likeNum}

                    commentNum={props.commentNum}
                    commentsAddArr={props.commentsAddArr}
                    commentsArr={props.commentsArr}
                />
            }
        </div>
    )
}