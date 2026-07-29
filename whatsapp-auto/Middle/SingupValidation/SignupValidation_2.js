import { Shop } from '../../models/Shop.js';

export const SignupValidation_2 = async(req,res,next)=>{
    
        const {businessName,email,password,inviteCode} = req.body;
        const user = await Shop.findOne({email});
        if(user){
            return res.status(409).json({message:"bhai teri id se phle hi signup ho rkha h",success:false});
        }
        if (inviteCode !== process.env.INVITE_CODE) {
                    return res.status(403).json({ error: "Invalid invite code" });
                    
                }
        next();
};
