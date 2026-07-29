import { OtpModel } from "../../models/otp.js";

export const verifyOTP = async(req,res,next) => {
 try{
    const {name,email,password,otp} = req.body;
    
    const user_otp = await OtpModel.findOne({email:email});

    if(!user_otp){
        return res.status(404).json({message:"ya to otp generate nhi hua ya fir expired h",success:false});
    }

    if(otp != user_otp.otp){
        return res.status(409).json({message:"glt otp h bhai",success:false});      
    }

    next();

    }catch(err){
    console.log(err);
    return res.status(409).json({
        message:`error: ${err}`,
        success:false,
    });
 }
};
