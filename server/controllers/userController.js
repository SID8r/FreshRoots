import bcrypt from 'bcryptjs';
import User from "../models/user.js";
import jwt from 'jsonwebtoken';
// Register User :/api/user/register



export const register=async(req,res)=>{
    try{
        const{name,email,password}=req.body;
        
        //Detailes Missing 
        if(!name || !email || !password){
            return res.json({success:false,message:'Details missing'});
        }

        //Already existing user 

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.json({success:false , message:'User already exist'});
        }

        //Creating a User

          // encrypting password using bcrypt
          const hashedPassword = await bcrypt.hash(password,10);
        
          const user= await User.create({name ,email,password:hashedPassword});

          // creating jwt token

          const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

          res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?'none':'strict',
            maxAge:7*24*60*60*1000,
          });

          return res.json({success:true ,user:{email:user.email,name:user.name}});
    }
    catch(error){
        console.log(error.message);
        res.json({success:false ,message:error.message});
    }
}

// Login :/api/user/login

export const login=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email || !password){
            return res.json({
                success:false,
                message:"Email and Password are required "
            });
        }
        const user =await User.findOne({email});
        if(!user){
            return res.json({
                success:false,
                message:"User not found ,register"
            });
        }

        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({
                success:false,
                message:"Inavalid password"
            });
        }
        const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token,{
          httpOnly:true,
          secure:process.env.NODE_ENV==="production",
          sameSite:process.env.NODE_ENV==="production"?'none':'strict',
          maxAge:7*24*60*60*1000,
        });

        return res.json({success:true ,user:{email:user.email,name:user.name}});
        
    } catch (error) {
        console.log(error.message);
        res.json({success:false ,message:error.message});
    }
}

// Check auth : /api/user/is-auth

export const isAuth=async(req,res)=>{
    try {
       const userId=req.userId;
       const user=await User.findById(userId).select("-password");
       return res.json({success:true,user});
    } catch (error) {
        console.log(error.message);
        res.json({success:false ,message:error.message});
    }
}

// logout : /api/user/logout

export const logout=async(req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'?'null':'strict',
        })
        return res.json({success:true,message:"logged out"});
    } catch (error) {
        console.log(error.message);
        res.json({success:false ,message:error.message}); 
    }
}