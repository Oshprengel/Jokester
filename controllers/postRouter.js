//this router is used for everything involving the main stats/post page

//dependecies
const express = require('express');
const Post = require('../models/postModel');
const User = require('../models/userModel')
const { post } = require('./userRouter');
const postRouter = express.Router();

//////////////////////
//index/redirect routes
//////////////////////
//post pages route 
postRouter.get('/all-posts',(req,res)=>{
    //find all posts then render allposts with foundposts
    Post.find({},(error, foundPosts)=>{
        res.render('allPosts.ejs',{
            //the current user
            currUser:req.session.currUser, 
            //allposts by any user
            allPosts:foundPosts
        })
    })
})

postRouter.get('/stats',(req,res)=>{
    findTopThree('_',()=>{
        console.log(topThree)
        res.render('stats.ejs',{topPosts:topThree})
    })
})

//only users posts page
postRouter.get('/my-posts',(req,res)=>{
    //finds all the posts by the current session user
    Post.find({author:req.session.currUser.name},(error,foundPosts)=>{
        res.render('myPosts.ejs',{
            allPosts:foundPosts,
            currUser:req.session.currUser})
    }) 
})

//current user page
postRouter.get('/current-user',(req,res)=>{
    res.render('currentUser.ejs',{user:req.session.currUser})
})

//redirect route
postRouter.post('/',(req,res)=>{
    //make the author of the post the current user in the session
    req.body.author = req.session.currUser.name
    req.body.likesById = []
    //create a new post with the req.body elements 
    Post.create(req.body,(error)=>{
        //once the post is created
        res.redirect(`/posts/${req.query.currPage}`)
    })
})


//////////////////////
//like and sike routes
//////////////////////

//like route
postRouter.put('/like/:postID', (req,res)=>{
    addLike(req.params.postID,req.session.currUser._id,()=>{
        res.redirect(`/posts/${req.query.currPage}`)
    })
})

//sike route
postRouter.put('/sike/:postID', (req,res)=>{
    removeLike(req.params.postID,req.session.currUser._id,()=>{
        res.redirect(`/posts/${req.query.currPage}`)
    })
})
//////////////////////
//update routes
//////////////////////
//edit page

//delete route
postRouter.delete('/:postID',(req,res)=>{
    Post.findByIdAndDelete(req.params.postID, ()=>{
        res.redirect(`/posts/${req.query.currPage}`)
    })
})

postRouter.post(`/:postID/edit`,(req,res)=>{
    Post.findById(req.params.postID,(error, foundPost)=>{
        res.render('editPost.ejs',{
            post:foundPost,
            currPage:req.query.currPage})
    })
})

//edit route
postRouter.put('/:postID',(req,res)=>{
    Post.findByIdAndUpdate(req.params.postID,{body:req.body.body}, ()=>{
        res.redirect(`/posts/${req.query.currPage}`)
    })
})


//////////////////////
//extra functions
//////////////////////
function addLike(postID, userID, callBack){
    let updatedPost = null;
    //first finds the posts current likes likesById value
    Post.findById(postID,(error,foundPost)=>{
        //concats the userid to the found post
        updatedPost = foundPost.likesById.concat(userID)
        Post.findByIdAndUpdate(postID,{likesById:updatedPost},(error,foundPost)=>{
            callBack()
        })
    })
}

function removeLike(postID, userID, callBack){
    let updatedPost = null;
    //first finds the posts current likes likesById value
    Post.findById(postID,(error,foundPost)=>{
        //removes the user id from the likes by id array
        updatedPost = foundPost.likesById.filter(element => element !==userID)
        Post.findByIdAndUpdate(postID,{likesById:updatedPost},(error,foundPost)=>{
            callBack()
        })
    })
}

var topThree = [{title:null,total:0,author:null},{title:null,total:0,author:null},{title:null,total:0,author:null}]
function findTopThree(type = "posts",callBack){
    //returns an array of the top three users or posts which contains three objects containing the user/post and number of likes
    topThree = [{title:null,total:0,author:null},{title:null,total:0,author:null},{title:null,total:0,author:null}]
    //first get an array of all the current posts
    Post.find({},(error,foundPosts)=>{
        
        //loops through the arrays
        foundPosts.forEach((currPost)=>{
            //total likes for each post 
            let totalLikes = currPost.likesById.length
            //now loop through the topthree array 
            var indx = 0
            for(currEle of topThree){
                if (currEle.total<=totalLikes){
                    let newEle ={title: currPost.body, total:totalLikes,author:currPost.author}
                    topThree.splice(indx,0,newEle)
                    topThree.pop()
                    break
                }
                indx+=1
            }
        })
        callBack()
    })

}

module.exports=postRouter