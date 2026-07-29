import joi from 'joi';

export const signupValidation_1 = (req,res,next)=>{
    const Schema = joi.object({
        businessName: joi.string().min(3).required(),
        email: joi.string().email().required(),
        password: joi.string().min(8).required(),
        inviteCode: joi.string().min(6).required(),
    });
    const {error} = Schema.validate(req.body);
    if(error){
        return res.status(400)
            .json({message:"password must be 8 ch long",error});
    }
    next();
};
