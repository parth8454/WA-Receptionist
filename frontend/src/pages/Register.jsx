import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scissors, Loader2, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        businessName: '',
        email: '',
        password: '',
        inviteCode: '',
        otp: ''
    });

    const handleSendOTP = async () => {
        setError('');
        if (!form.businessName || !form.email || !form.password || !form.inviteCode) {
            setError('All fields are required');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                businessName: form.businessName,
                email: form.email,
                password: form.password,
                inviteCode: form.inviteCode
            });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        if (!form.otp) {
            setError('Please enter OTP');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${BASE_URL}/auth/register/signup`, {
                businessName: form.businessName,
                email: form.email,
                password: form.password,
                otp: form.otp
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-4">
                        <Scissors size={28} className="text-white" />
                    </div>
                    <h1 className="text-white text-2xl font-bold">Create your shop</h1>
                    <p className="text-gray-400 text-sm mt-1">Setup your WhatsApp automation</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                        step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'
                    }`}>1</div>
                    <div className={`h-0.5 w-12 transition-colors ${
                        step >= 2 ? 'bg-green-500' : 'bg-gray-700'
                    }`} />
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                        step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'
                    }`}>2</div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Step 1 */}
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm">Business Name</label>
                                <input
                                    type="text"
                                    placeholder="Raja's Salon"
                                    value={form.businessName}
                                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm">Email</label>
                                <input
                                    type="email"
                                    placeholder="shop@email.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm">Invite Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter invite code"
                                    value={form.inviteCode}
                                    onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>

                            <button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? <><Loader2 size={15} className="animate-spin" /> Sending OTP...</>
                                    : <><ArrowRight size={15} /> Continue</>
                                }
                            </button>
                        </>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <>
                            <div className="flex flex-col items-center py-2 gap-2">
                                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                                    <Mail size={24} className="text-green-400" />
                                </div>
                                <p className="text-white font-medium text-center">
                                    Check your email
                                </p>
                                <p className="text-gray-400 text-xs text-center">
                                    We sent an OTP to <span className="text-white">{form.email}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-gray-400 text-sm">Enter OTP</label>
                                <input
                                    type="text"
                                    placeholder="123456"
                                    maxLength={6}
                                    value={form.otp}
                                    onChange={(e) => setForm({ ...form, otp: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors text-center text-lg tracking-widest"
                                />
                            </div>

                            <button
                                onClick={handleVerifyOTP}
                                disabled={loading}
                                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? <><Loader2 size={15} className="animate-spin" /> Verifying...</>
                                    : <><ArrowRight size={15} /> Create Shop</>
                                }
                            </button>

                            <button
                                onClick={() => {
                                    setStep(1);
                                    setError('');
                                }}
                                className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                            >
                                <ArrowLeft size={14} />
                                Back
                            </button>

                            <p className="text-center text-gray-500 text-xs">
                                Didn't receive OTP?{' '}
                                <button
                                    onClick={handleSendOTP}
                                    className="text-green-400 hover:text-green-300"
                                >
                                    Resend
                                </button>
                            </p>
                        </>
                    )}

                    <p className="text-center text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-green-400 hover:text-green-300">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}