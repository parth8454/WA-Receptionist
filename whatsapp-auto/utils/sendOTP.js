import axios from 'axios';

export const sendOTP = async(email,otp)=>{
    const api = process.env.API_KEY;
    const url = 'https://api.brevo.com/v3/smtp/email';

    const emaildata = {
        sender:{
            name:"WA-Auto",
            email:process.env.EMAIL_USER
        },
        to:[{
            email:email,
        }],
        subject:"OTP FOR WA-Auto SIGNUP",
        htmlContent:`Bhai,tera OTP ye raha: ${otp}.Jaldi daal de!`
    };

    try{
        const response  = await axios.post(url,emaildata,{
            headers:{
                'Content-Type':'application/json',
                'api-key':api
            }
        })
    }catch(err){
        console.log(err);
    }
}
