import express from 'express';
import { registerShop, loginShop } from '../controllers/authController.js';
import {signupValidation_1} from '../Middle/SingupValidation/SignupValidation_1.js';
import {SignupValidation_2} from '../Middle/SingupValidation/SignupValidation_2.js';
import {OTPbhejna} from '../controllers/Signup_otp.js';
import {verifyOTP} from '../Middle/SingupValidation/verify_otp.js';

const router = express.Router();

router.post('/register', signupValidation_1, SignupValidation_2, OTPbhejna);
router.post('/register/signup', verifyOTP, registerShop);

router.post('/login', loginShop);

export default router;