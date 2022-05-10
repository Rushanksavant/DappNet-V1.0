// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract Post {
    address public owner;
    using Counters for Counters.Counter;
    Counters.Counter private postId;

    struct Posts {
        uint256 id;
        string description;
        string img_hash;
        address author;
        uint256 likes;
        uint256 comments;
    }
    event postCreated(
        // to log post creation
        uint256 indexed id,
        string description,
        string img_hash,
        address indexed author
    );
    event postDeleted(
        // to log post creation
        uint256 indexed id,
        string description,
        string img_hash,
        address indexed deleteor // either author or contract owner
    );

    mapping(uint256 => Posts) public id_Post;

    mapping(uint256 => address[]) public id_likedAdd; // will store addresses of users who have liked postId
    mapping(address => mapping(uint256 => uint256)) public address_id_liked; // to keep track of posts liked by each address
    // address_id_liked will store the postId and uint(1/0->not liked, 2->liked) for every address
    event postLiked(
        // to log post like
        uint256 indexed id,
        address indexed liker,
        address author,
        string img_hash
    );
    event postLikeCancled(
        // to log post like cancled
        uint256 indexed id,
        address indexed likeCanceler,
        address author,
        string img_hash
    );

    mapping(uint256 => string[]) public id_comments; // will store comments for every postId
    mapping(address => mapping(uint256 => string[])) public address_id_comments; // will store comments given by addresses on each postId
    mapping(uint256 => mapping(string => address)) public id_comment_poster; // will store addresses of comment posters on a particular postId
    // id_comment_poster will not be updated while deleting comment
    event commented(
        // to log comment posting
        uint256 indexed id,
        address indexed commentPoster,
        string comment,
        address author,
        string img_hash
    );
    event commentDeleted(
        // to log comment deletion from a post
        uint256 indexed id,
        address indexed commentDeletor,
        string comment,
        address author,
        string img_hash
    );

    // --------------------------------------------------------------------------------------------------------------- //

    constructor() {
        owner = msg.sender;
    }

    modifier postIdExists(uint256 _postId) {
        // Post id should exist
        require(_postId > 0, "Invalid post id");
        require(_postId <= postId.current(), "Invalid post id");
        _;
    }

    // creating new post
    function createPost(string calldata _description, string calldata _img_hash)
        external
    {
        require(bytes(_img_hash).length > 0, "Nothing to post"); // image should exist
        postId.increment();
        uint256 currentPostId = postId.current();

        Posts storage post = id_Post[currentPostId];
        post.id = currentPostId;
        post.description = _description;
        post.img_hash = _img_hash;
        post.author = msg.sender;

        //logging
        emit postCreated(currentPostId, _description, _img_hash, msg.sender);
    }

    // deleting (existing) post
    function deletePost(uint256 _postId) external postIdExists(_postId) {
        //42732
        // caller should be the author or owner
        Posts storage postToDelete = id_Post[_postId];
        require(
            msg.sender == postToDelete.author || msg.sender == owner,
            "Only author of this post or owner of contract can delete"
        );

        //logging
        emit postDeleted(
            _postId,
            postToDelete.description,
            postToDelete.img_hash,
            msg.sender
        );

        // deleting post
        delete (id_Post[_postId]); // deleting particular element from mapping
    }

    // to update (existing) post
    function updatePost(
        uint256 _postId,
        bool img_change,
        bool description_change,
        string calldata _img_hash,
        string calldata _description
    ) external postIdExists(_postId) {
        // caller should be the author
        Posts storage postToUpdate = id_Post[_postId];
        require(
            msg.sender == postToUpdate.author,
            "Only author of this post can delete"
        );

        if (img_change == true) {
            // if img needs to be changed
            require(
                bytes(_img_hash).length > 0,
                "Post cannot be saved without image"
            ); // img should exist in the update
            postToUpdate.img_hash = _img_hash; // chaning img
        }

        if (description_change == true) {
            // if description needs to be cahnged
            require(
                bytes(_description).length > 0,
                "Post cannot be saved without description"
            ); // description should exist in the update
            postToUpdate.description = _description; // changing description
        }
    }

    // to like (existing) post, which caller has not liked before
    function likePost(uint256 _postId) external postIdExists(_postId) {
        // Caller has not liked this post before
        require(
            address_id_liked[msg.sender][_postId] != 2,
            "You have already liked this post"
        );

        // Liking post
        Posts storage postToLike = id_Post[_postId];
        postToLike.likes++; // increase like of the post

        // changing the liked info in address_id_liked
        address_id_liked[msg.sender][_postId] = 2;

        // adding liker address to id_likedAdd
        id_likedAdd[_postId].push(msg.sender);

        // logging
        emit postLiked(
            _postId,
            msg.sender,
            id_Post[_postId].author,
            id_Post[_postId].img_hash
        );
    }

    // to cancle like of (existing) post, which caller has liked before
    function cancleLike(uint256 _postId) external postIdExists(_postId) {
        console.log("Liked status-> ", address_id_liked[msg.sender][_postId]);
        // Caller has liked this post before
        require(
            address_id_liked[msg.sender][_postId] == 2,
            "You haven't liked this post yet"
        );
        console.log("COnditions passed");

        // Cancle one like
        Posts storage postToLike = id_Post[_postId];
        postToLike.likes--; // decrease like of the post
        console.log("like decreased");

        // changing the liked info in address_id_liked
        address_id_liked[msg.sender][_postId] = 1; // changing the liked info

        // removing liker address from id_likedAdd
        for (uint256 index = 0; index < id_likedAdd[_postId].length; index++) {
            if (id_likedAdd[_postId][index] == msg.sender) {
                delete id_likedAdd[_postId][index];
                break;
            }
        }
        console.log("Liked info changed");

        // logging
        emit postLikeCancled( // to log post like cancled
            _postId,
            msg.sender,
            id_Post[_postId].author,
            id_Post[_postId].img_hash
        );
    }

    // add comment to a (existing) post
    function commentPost(uint256 _postId, string calldata _comment)
        external
        postIdExists(_postId)
    {
        // add comment to id_comments
        id_comments[_postId].push(_comment);

        // add comment to address_id_comments
        address_id_comments[msg.sender][_postId].push(_comment);

        // add comment to id_comment_poster
        id_comment_poster[_postId][_comment] = msg.sender;

        // increase comments number for postId
        Posts storage postCommentedOn = id_Post[_postId];
        postCommentedOn.comments++;

        // logging
        emit commented(
            _postId,
            msg.sender,
            _comment,
            id_Post[_postId].author,
            id_Post[_postId].img_hash
        );
    }

    // delete comment from (existing) post, which caller already posted

    function deleteComment(uint256 _postId, string calldata _comment)
        external
        postIdExists(_postId)
    {
        Posts storage postCommentDeleteFrom = id_Post[_postId];

        // if caller is not the post author(can be the comment poster)
        if (msg.sender == id_comment_poster[_postId][_comment]) {
            // delete from address_id_comments
            for (
                uint256 i;
                i < address_id_comments[msg.sender][_postId].length;
                i++
            ) {
                if (
                    keccak256(
                        bytes(address_id_comments[msg.sender][_postId][i])
                    ) == keccak256(bytes(_comment))
                ) {
                    address_id_comments[msg.sender][_postId][i] = "nan";
                    break;
                }
            }
            // delete from id_comments and reduce 1 comment number from  postCommentDeleteFrom
            for (uint256 j; j < id_comments[_postId].length; j++) {
                if (
                    keccak256(bytes(id_comments[_postId][j])) ==
                    keccak256(bytes(_comment))
                ) {
                    id_comments[_postId][j] = "nan";
                    postCommentDeleteFrom.comments--;
                    break;
                }
            }
            // Note: id_comment_poster is not update(because it's not required)
        }
        // if caller is post author (same will be executed when author is comment poster or caller is owner)
        else if (
            msg.sender == postCommentDeleteFrom.author || msg.sender == owner
        ) {
            for (uint256 j; j < id_comments[_postId].length; j++) {
                if (
                    keccak256(bytes(id_comments[_postId][j])) ==
                    keccak256(bytes(_comment))
                ) {
                    id_comments[_postId][j] = "nan";
                    postCommentDeleteFrom.comments--;
                    break;
                }
            }
        } else {
            revert("You cannot delete this comment");
        }

        // logging
        emit commentDeleted(
            _postId,
            msg.sender,
            _comment,
            id_Post[_postId].author,
            id_Post[_postId].img_hash
        );
    }

    // getter functions:

    function getAllPosts() external view returns (Posts[] memory) {
        // to get all posts
        uint256 postCount = postId.current();

        Posts[] memory posts = new Posts[](postCount);

        for (uint256 i = 0; i < postCount; i++) {
            Posts storage thisPost = id_Post[i + 1];
            posts[i] = thisPost;
        }

        return posts;
    }

    function getCommentsPost(uint256 _postId)
        external
        view
        returns (string[] memory)
    {
        // to get comments on a post
        return (id_comments[_postId]);
    }

    function getCommentPoster(uint256 _postId, string calldata _comment)
        external
        view
        returns (address)
    {
        // to get add of comment poster
        return (id_comment_poster[_postId][_comment]);
    }

    function idLikedAddresses(uint256 _postId)
        external
        view
        returns (address[] memory)
    {
        // to get addresses which have liked a postId
        return (id_likedAdd[_postId]);
    }
}
