import exp from 'express'
import { UserModel} from '../models/UserModel.js'
import { ArticleModel } from '../models/ArticleModel.js'
import { verifyToken } from '../middlewares/verifyToken.js'
export const authorApp=exp.Router()

//write article
authorApp.post("/article",verifyToken("AUTHOR"),async(req,res)=>{

    const articleObj=req.body
    //console.log(req.user)
    let user=req.user
    let author = await UserModel.findById(articleObj.author)

    if(!author){
        return res.status(404).json({message:"invalid author"})
    }
    if(author.email!=user.email){
        return res.status(403).json({message:"you are not authorized"})
    }
    if(author.role!="AUTHOR"){
        return res.status(403).json({message:"only author can publish"})
    }

        const articleDoc= new ArticleModel(articleObj)
        //save document
        await articleDoc.save()
        //send res
        res.status(201).json({message:"article published"})
})

//read own articles
authorApp.get("/articles",verifyToken("AUTHOR"),async(req,res)=>{
    //read article by author email
    const authorIdOfToken=req.user?.id
     let articleList =await ArticleModel.find({author:authorIdOfToken});
    //send req
    res.status(200).json({message:"articles",payload:articleList})
});

//update article
authorApp.put("/articles",verifyToken("AUTHOR"),async(req,res)=>{
    //get author id from decoded token
    const authorIdOfToken=req.user?.id;
    //get modified article from client
    const {articleId,title,category,content}=req.body
    //find by id and update
    const modifiedArticle = await ArticleModel.findOneAndUpdate({_id:articleId,author:authorIdOfToken},
        {$set:{title,category,content}},
        {new:true}
    )
    if(!modifiedArticle){
        return res.status(403).json({message:"not authorized to edit article"})
    }
    res.status(200).json({message:"article modified",payload:modifiedArticle})
})

authorApp.patch("/articles",verifyToken("AUTHOR"),async(req,res)=>{
    //get author id from decoded token
    const authorIdOfToken=req.user?.id
    //get modified article from client
    const {articleId,isArticleActive}=req.body
    //get article by id
    const articleOfDB=await ArticleModel.findOne({_id:articleId,author:authorIdOfToken})
    //check status
    if(isArticleActive===articleOfDB.isArticleActive){
        return res.status(200).json({message:"Article already in the same state"})
    }

    articleOfDB.isArticleActive=isArticleActive
    await articleOfDB.save()
    //send res
    res.status(200).json({message:"Article modified",payload:articleOfDB})
})
