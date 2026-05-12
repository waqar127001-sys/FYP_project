const userModel = require("../Models/Users");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const signup = async(req, res) => {

    try{
     console.log("req from the Controller>>",req);
       const { name, email, password } = req.body;
       const user = await userModel.findOne({email});
       if(user){
           return res.status(400).json({message:"user already exists",success:false});
       }
       const hashedPassword = await bcrypt.hash(password, 10);
       const newUser = new userModel({ name, email, password: hashedPassword }); 
       await newUser.save();
       res.status(201).json({message:"user created successfully",success:true, user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }});
    }catch(error){
        res.status(500).json({
            message:"Internal server error!",
            success:false
        });
    }
    };
     
    const login = async(req, res) => {
        
        try{
            // console.log("req>>",req);
           const {  email, password } = req.body;
           const user = await userModel.findOne({email});
           const errorMsg="Authentication failed! email or password is wrong.";
           if(!user){
               return res.status(403).json({message:errorMsg,success:false});
           }
         const isEqualPassword = await bcrypt.compare(password,user.password);
         if(!isEqualPassword){
            return res.status(403).json({message:errorMsg,success:false});

         }
         const jwtToken = jwt.sign(
            {email: user.email,_id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: "24h"}

         )
           res.status(201).json({message:"Login successfully ;)",success:true,
              token:jwtToken,
                user:{
                    id:user._id,
                    name:user.name,
                    email:user.email
                }
           });
        }catch(error){
            res.status(500).json({
                message:"Internal server error!",
                success:false
            });
        }
        };
    
   
    
    module.exports = {
        signup,
        login,
       
    };