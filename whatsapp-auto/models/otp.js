import required from 'joi';
import mongoose from 'mongoose';
const schema = mongoose.Schema;

const otpSchema = new schema({

    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    created:{
        type:Date,
        default:Date.now,
        expires:60,
    }

});
export const OtpModel = mongoose.model('otp', otpSchema);