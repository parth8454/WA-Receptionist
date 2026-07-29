import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendBroadcast } from '../services/api';
import { Megaphone, Loader2, CheckCircle, Users, AlertTriangle } from 'lucide-react';
import { getStats } from '../services/api';
import {useEffect} from 'react';

export default function Broadcast() {
    const { shop } = useAuth();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(false);

    const templates = [
        {
            label: 'Special Offer',
            text: `Bhai ${shop?.businessName} mein aaj special offer hai! Haircut + Beard trim sirf ₹199 mein. Pehle aao pehle pao`
        },
        {
            label: 'Holiday Notice',
            text: `${shop?.businessName} ki taraf se notice: Kal hum band rahenge. Appointments ke liye reply karo`
        },
        {
            label: 'New Service',
            text: `Naya service available hai ${shop?.businessName} mein! Aao try karo aur batao kaisa laga`
        },
    ];

    const handleSend = async () => {
        if (!message.trim()) return;
        setError('');
        setLoading(true);
        try {
            await sendBroadcast({ shopId: shop.id, message });
            setSuccess(true);
            setMessage('');
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            setError(err.response?.data?.error || 'Broadcast failed');
        } finally {
            setLoading(false);
        }
    };

    const [stats, setStats] = useState({
    totalCustomers: 0,
    messagesToday: 0,
    appointmentsToday: 0
    });

    useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await getStats(shop.id);
            setStats({
                totalCustomers: res.data.totalCustomers,
                messagesToday: res.data.messagesToday,
                appointmentsToday: 0
            });
        } catch (err) {
            console.error(err);
        }
    };
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-white text-2xl font-bold">Broadcast</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Send a message to all your past customers at once
                </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3">
                <AlertTriangle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-yellow-400 text-sm font-medium">Use responsibly</p>
                    <p className="text-yellow-400/70 text-xs mt-0.5">
                        Only send relevant updates. Spamming customers can get your number banned.
                        Max 1-2 broadcasts per week recommended.
                    </p>
                </div>
            </div>

            {/* Templates */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4">Quick Templates</h2>
                <div className="space-y-2">
                    {templates.map((t) => (
                        <button
                            key={t.label}
                            onClick={() => setMessage(t.text)}
                            className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
                        >
                            <p className="text-white text-sm font-medium">{t.label}</p>
                            <p className="text-gray-400 text-xs mt-1 line-clamp-1">{t.text}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Compose */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                    <Megaphone size={18} className="text-green-400" />
                    Compose Message
                </h2>

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                        <CheckCircle size={16} />
                        Broadcast sent successfully to all customers!
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <textarea
                    rows={5}
                    placeholder="Type your message in Hinglish or Hindi..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors resize-none"
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Users size={13} />
                        Will be sent to all past customers
                    </div>
                    <span className={`text-xs ${message.length > 500 ? 'text-red-400' : 'text-gray-400'}`}>
                        {message.length}/500
                    </span>
                </div>

                {/* Preview */}
                {message && (
                    <div>
                        <button
                            onClick={() => setPreview(!preview)}
                            className="text-gray-400 hover:text-white text-xs transition-colors"
                        >
                            {preview ? 'Hide preview' : 'Show preview'}
                        </button>
                        {preview && (
                            <div className="mt-3 bg-gray-800 rounded-xl p-4 max-w-xs">
                                <div className="bg-green-900/40 rounded-lg p-3">
                                    <p className="text-white text-sm">{message}</p>
                                    <p className="text-gray-400 text-xs mt-1 text-right">
                                        {new Date().toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={handleSend}
                    disabled={loading || !message.trim() || message.length > 500}
                    className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {loading
                        ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
                        : <><Megaphone size={15} /> Send Broadcast</>
                    }
                </button>
            </div>
        </div>
    );
}