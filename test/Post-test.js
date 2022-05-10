const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Post", function () {

    beforeEach(async function () {
        [owner, add1, add2, ...addrs] = await ethers.getSigners();

        // Deploying Post contract
        Post = await ethers.getContractFactory("Post").then(contract => contract.deploy());
        await Post.deployed(); // contract address = Post.address

        // create post (this post will be created at postId = 1)
        await Post.connect(add1).createPost("this is post description", "0x0123456789"); // description, img_hash
    })

    it("Verify Post creation", async function () {
        // get post information from id_Post (using postId=1)
        // verify the description and img_hash  
        post = await Post.id_Post(1);
        expect(post.description).to.equal("this is post description");
        expect(post.img_hash).to.equal("0x0123456789");
    })

    it("Verify Post deletion", async function () {
        // delete post, using postId = 1 (note- only creator of post i.e add1 can delete)
        await Post.connect(add1).deletePost(1);

        // verify the description and img_hash are set back to default
        post = await Post.id_Post(1);
        expect(post.description).to.equal("");
        expect(post.img_hash).to.equal("");
    })

    it("Verify Post updation", async function () {
        // update post at postId = 1 (updating description and img_hash)
        // (note- only creator of post i.e add1 can update)
        await Post.connect(add1).updatePost(1, true, true, "0x9876543210", "this is the new description");

        // verify the description and img_hash are updated
        post = await Post.id_Post(1);
        expect(post.description).to.equal("this is the new description");
        expect(post.img_hash).to.equal("0x9876543210");
    })

    it("Verify post like, and caller information update", async function () {
        // like post(of postId = 1) using add2
        await Post.connect(add2).likePost(1);

        // verify post like update
        post = await Post.id_Post(1);
        expect(post.likes).to.equal(1);

        // verify caller information update
        post_liked_info = await Post.address_id_liked(add2.address, 1); // caller of likePost, postId
        expect(post_liked_info).to.equal(2); // if a add likes a post, then uint corresponding to its add and postId is set to 2
    })

    it("Verify post cancle like, and caller information update", async function () {
        // like post(of postId = 1) using add2
        await Post.connect(add2).likePost(1);

        // cancle like of post(of postId = 1) using add2
        await Post.connect(add2).cancleLike(1);

        // verify post like update
        post = await Post.id_Post(1);
        expect(post.likes).to.equal(0);

        // verify caller information update
        post_liked_info = await Post.address_id_liked(add2.address, 1); // caller of likePost, postId
        expect(post_liked_info).to.equal(1); // if a add cancle like on a post, then uint corresponding to its add and postId is set to 1
    })

    it("Verify comment on post, and caller information update", async function () {
        // post comment to postId = 1, using add2
        await Post.connect(add2).commentPost(1, "this comment is for postId = 1");

        // verify comment information for id_comments
        id_comments_info = await Post.id_comments(1, 0);
        expect(id_comments_info).to.equal("this comment is for postId = 1");

        // verify comment information for address_id_comments
        address_id_comments_info = await Post.address_id_comments(add2.address, 1, 0);
        expect(address_id_comments_info).to.equal("this comment is for postId = 1");

        // verify comment number for postId = 1
        post = await Post.id_Post(1);
        expect(post.comments).to.equal(1);
    })

    it("Verify delete comment on post (if comment delete caller is comment poster)", async function () {
        // post comment to postId = 1, using add2
        await Post.connect(add2).commentPost(1, "this comment is for postId = 1");

        // delete comment on postId =1, using add2
        await Post.connect(add2).deleteComment(1, "this comment is for postId = 1");

        // verify comment information for id_comments
        id_comments_info = await Post.id_comments(1, 0);
        expect(id_comments_info).to.equal("nan");

        // verify comment information for address_id_comments
        address_id_comments_info = await Post.address_id_comments(add2.address, 1, 0);
        expect(address_id_comments_info).to.equal("nan");

        // verify comment number for postId = 1
        post = await Post.id_Post(1);
        expect(post.comments).to.equal(0);
    })

    it("Verify delete comment on post (if comment delete caller is post author)", async function () {
        // post comment to postId = 1, using add2
        await Post.connect(add2).commentPost(1, "this comment is for postId = 1");

        // delete comment on postId =1, using add1 (post author, check beforEach)
        await Post.connect(add1).deleteComment(1, "this comment is for postId = 1");

        // verify comment information for id_comments
        id_comments_info = await Post.id_comments(1, 0);
        expect(id_comments_info).to.equal("nan");

        // Note: comment information is not updated for address_id_comments, when post author deletes the comment (hence not verifying it)

        // verify comment number for postId = 1
        post = await Post.id_Post(1);
        expect(post.comments).to.equal(0);
    })
})