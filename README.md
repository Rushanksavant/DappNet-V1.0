# DappNet V1.0
Application link - https://dappnet-v1.netlify.app/
Contracts deployed on Ropsten test-net:
	- Post-> 0xCC11252eccB8141616099cC8adb9868927dE9cB6
	- Profile-> 0xc6f2A25E1EF3A946e1C8567b9D3Ec9177eC6f977

## Features:
- Make a profile on network to create post, like/comment on other's post. Profile requires name, bio and profile image (all needed).
- Profile can be created from "Your Profile" section. User cannot interact (like, comment, post) if user profile is not created. Only one profile permitted
per address.
- Create a post with image and caption. Others can comment and like on your post. You can delete anyone's comment you dont want on your post.
- Owner of DappNet (me) can delete posts and comments on anyone's post if inappropriate content is posted.
- View your activity, Posts created/deleted, Posts liked/cancle liked, Comment you posted/deleted on any post in "Your Activity".

## Limitation:
- Responsiveness of the application.
- The contract can be further optimized for gas. 

## What's for V2.0?
- Responsiveness and better UI
- Optimized smart contract
- Features:
	- Follow/unfollow a user (similar to what we have on general socila media platforms, like Instagram)
	- Convert your post into a NFT or a yeild generating asset
	-  

## Frontend:
- ***Explore(home)***
	- If your wallet is connected, and your profile is created on the DappNet, you can:
		- Create post
		- Like/Comment on other's post
		- Delete Like/Comment on other's post
- ***Your Activity***
	-  If you have created your profile on the DappNet, you can view all your activity 
- ***Your Profile***
	- You can create profile here (Note: without creating profile you won't be able to interact on DappNet)
	- All the posts which you have created can be seen here.

## Smart contracts:

### 1. Profile.sol
***State variables:***<br>
mapping(address => string[3]) public address_name_imgHash_bio

***Functions:***
- function updateName(string memory _name) external {}
	- set first element of array in address_name_imgHash_bio as _name

- function updateImg(string calldata _imgHash) external {}
	- set second element of array in address_name_imgHash_bio as _imgHash

- function updateBio(string calldata _bio) external {}
	- set third element of array in address_name_imgHash_bio as _bio

- function getter(uint256 index) external view returns (string memory) {}
	- returns details for function caller

- function getter_Address(address add, uint256 index) external view returns (string memory) {}
	- returns details for any address

### 2. Post.sol
***Dependencies:***<br>
- import "@openzeppelin/contracts/utils/Counters.sol";
- import "hardhat/console.sol";

***State variables:***
- address public owner;
- Counters.Counter private postId;
- struct Posts { <br>
        uint256 id; <br>
        string description; <br>
        string img_hash; <br>
        address author; <br>
        uint256 likes; <br>
        uint256 comments; <br>
    }
- event postCreated( // to log post creation <br>
        uint256 indexed id, <br>
        string description, <br>
        string img_hash, <br>
        address indexed author <br>
    );
- event postDeleted( // to log post creation <br>
        uint256 indexed id, <br>
        string description, <br>
        string img_hash, <br>
        address indexed deleteor // either author or contract owner <br>
    );

- mapping(uint256 => Posts) public id_Post;

-  mapping(uint256 => address[]) public id_likedAdd; // will store addresses of users who have liked postId
- mapping(address => mapping(uint256 => uint256)) public address_id_liked; // to keep track of posts liked by each address <br>
    // address_id_liked will store the postId and uint(1/0->not liked, 2->liked) for every address
- event postLiked( // to log post like <br>
        uint256 indexed id, <br>
        address indexed liker, <br>
        address author, <br>
        string img_hash <br>
    );
- event postLikeCancled( // to log post like cancled <br>
        uint256 indexed id, <br>
        address indexed likeCanceler, <br>
        address author, <br>
        string img_hash <br>
    );

- mapping(uint256 => string[]) public id_comments; // will store comments for every postId
- mapping(address => mapping(uint256 => string[])) public address_id_comments; // will store comments given by addresses on each postId
- mapping(uint256 => mapping(string => address)) public id_comment_poster; // will store addresses of comment posters on a particular postId <br>
    // id_comment_poster will not be updated while deleting comment
- event commented(
        // to log comment posting <br>
        uint256 indexed id, <br>
        address indexed commentPoster, <br>
        string comment, <br>
        address author, <br>
        string img_hash <br>
    );
- event commentDeleted(
        // to log comment deletion from a post
        uint256 indexed id, <br>
        address indexed commentDeletor, <br>
        string comment, <br>
        address author, <br>
        string img_hash <br>
    );
    
***Functions:***
- ***constructor() ***
	- to set owner to deployer address

- ***modifier postIdExists(uint256 _postId) {}***
	- verify if postID exists

- ***function createPost(string calldata _description, string calldata _img_hash) external {}***
	- Check if image is selected to upload
	- increment postId
	- modify state variable (id_Post)
	- emit postCreated event

- ***function deletePost(uint256 _postId) external postIdExists(_postId) {}***
	- verify, function caller should be either post author or owner
	- emit postDeleted event
	- delete post element from id_Post

- ***function updatePost(uint256 _postId, bool img_change, bool description_change, string calldata _img_hash, string calldata _description) external postIdExists(_postId) {}***
	- function caller should be the author of the post
	- if bool img_change is true, img_has will be updated in id_Post (verify img_has is inputted begore updating id_Post)
	- if bool description_change is true, description will be updated in id_Post (verify img_has is inputted begore updating id_Post)

- ***function likePost(uint256 _postId) external postIdExists(_postId) {}***
	- verify if function caller has not liked the post before (address_id_liked[msg.sender][_postId] != 2)
	- update state variables address_id_liked and id_likedAdd
	- emit postLiked event

- ***function cancleLike(uint256 _postId) external postIdExists(_postId) {}***
	- verify if function caller has liked the post before (address_id_liked[msg.sender][_postId] == 2)
	- update state variables id_Post, address_id_liked, id_likedAdd
	- emit postLikeCancled event

- ***function commentPost(uint256 _postId, string calldata _comment) external postIdExists(_postId) {}***
	- update state variables id_comments, address_id_comments, id_comment_poster, id_Post
	- emit commented event

- ***function deleteComment(uint256 _postId, string calldata _comment) external postIdExists(_postId) {}***
	- if function caller is comment poster
		- update address_id_comments, id_comments to replace comment with "nan"
		- update id_Post to reduce number of comments
	- if function caller is post author or contract owner
		- update id_comments to replace comment with "nan"
		- update id_Post to reduce number of comments
	- if function caller is none of the above
		- revert
	- emit commentDeleted		

- ***function getAllPosts() external view returns (Posts[] memory) {}***
	- getting all posts from id_Post and storing them into an array
	- returning this array

- ***function getCommentsPost(uint256 _postId) external view returns (string[] memory) {}***
	- returns array of strings from id_comments, for _postId

- ***function getCommentPoster(uint256 _postId, string calldata _comment) external view returns (address) {}***
	- returns address of comment poster from id_comment_poster state variable  (id_comment_poster[_postId][_comment])

- ***function idLikedAddresses(uint256 _postId) external view returns (address[] memory) {}***
	- returns array of addresses who have liked the post (id_likedAdd[_postId])
