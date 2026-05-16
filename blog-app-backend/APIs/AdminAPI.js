import exp from 'express'
import { UserModel } from '../models/UserModel.js'
import { verifyToken } from '../middlewares/verifyToken.js'
export const adminApp = exp.Router()


//read all users and authors
adminApp.get("/users-authors",verifyToken("ADMIN"),async(req,res)=>{
    const usersAndAuthors=await UserModel.find({role:{$in:["USER","AUTHOR"]}})

res.status(200).json({message:"users and authors",payload:usersAndAuthors})
})

//block or active user or author
adminApp.patch("/block/:email",verifyToken("ADMIN"),async(req,res)=>{
    const email=req.params.email
    const user = await UserModel.findOne({email})
    if(!user){
        return res.status(404).json({message:"user not found"})
    }
    user.isUserActive = !user.isUserActive
    await user.save()
    res.status(200).json({
        message: user.isUserActive ? "User unblocked" : "User blocked",
        payload: user
    })
})