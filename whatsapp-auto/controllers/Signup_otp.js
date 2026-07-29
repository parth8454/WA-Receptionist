import { OtpModel } from "../models/otp.js";
import  {sendOTP} from '../utils/sendOTP.js';

export const OTPbhejna = async(req,res)=>{
    try{
        const {name,email,password} = req.body;

        const Exist = await OtpModel.findOne({email:email});
        
        if(Exist){
            return res.status(429).json({message: "Bhai abhi toh bheja tha! 1 minute wait kar le.",success: false});
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await sendOTP(email,otp);
        
        await OtpModel.create({email,otp,name});

        return res.status(200)
            .json({message:"bro OTP bhej dia h check krle"});

    }catch(err){
        console.log(err);
        return res.status(500).json({message:"OTP nhi jaa paa rha",error: err.message });
    }
};
