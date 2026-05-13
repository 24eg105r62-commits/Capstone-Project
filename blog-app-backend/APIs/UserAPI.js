import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import { ArticleModel } from '../models/ArticleModel.js'
export const userApp=exp.Router()

//read articles of all authors
userApp.get("/articles",verifyToken("USER"),async(req,res)=>{
    //read articles 
    const articleList=await ArticleModel.find({isArticleActive:true})

    res.status(200).json({message:"articles",payload:articleList})
})

//add comments to an article
userApp.put("/articles",verifyToken("USER"),async(req,res)=>{
    //get body from req
    const {articleId,comment}=req.body
    //check article
    const articleDocument=await ArticleModel.findOne({_id:articleId,isArticleActive:true})
    //if article not found
    if(!articleDocument){
        return res.status(404).json({message:"article not found"})
    }
    //get user id
    const userId=req.user?.id
    //add comment to comments array of articleDocument
    articleDocument.comments.push({user:userId,comment:comment})
    //save
    await articleDocument.save()
    //send res
    res.status(200).json({message:"comment added successfully",payload:articleDocument})
})
