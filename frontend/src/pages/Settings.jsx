import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateSettings } from '../services/api';
import {
    Settings as SettingsIcon,
    Key, Phone, Building,
    Loader2, CheckCircle, Eye, EyeOff
} from 'lucide-react';
import { disconnectWhatsApp } from '../services/api';




export default function Settings() {
    const [disconnecting, setDisconnecting] = useState(false);
    const { shop } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showGroqKey, setShowGroqKey] = useState(false);

    const [form, setForm] = useState({
    groqApiKey: '',
    businessName: shop?.businessName || '',
    address: shop?.shopDetails?.address || '',
    openingHours: shop?.shopDetails?.openingHours || '',
    closingDays: shop?.shopDetails?.closingDays || '',
    receptionNumber: shop?.shopDetails?.receptionNumber || '',
    about: shop?.shopDetails?.about || '',
    instagram: shop?.shopDetails?.instagram || '',
    });

    const handleDisconnect = async () => {
    if (!window.confirm('Are you sure? Bot will stop working until you reconnect.')) return;
    setDisconnecting(true);
    try {
        await disconnectWhatsApp(shop.id);
        // Update localStorage
        const updatedShop = { ...shop, isWhatsappConnected: false };
        localStorage.setItem('shop', JSON.stringify(updatedShop));
        alert('WhatsApp disconnected! Go to Dashboard to reconnect.');
        window.location.href = '/dashboard';
    } catch (err) {
        alert('Failed to disconnect');
    } finally {
        setDisconnecting(false);
    }
};

    const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
        await updateSettings({
            shopId: shop.id,
            clientGroqApiKey: form.groqApiKey || undefined,
            businessName: form.businessName || undefined,
            shopDetails: {
                address: form.address,
                openingHours: form.openingHours,
                closingDays: form.closingDays,
                receptionNumber: form.receptionNumber,
                about: form.about,
                instagram: form.instagram,
            }
        });

        // ← Update localStorage so refresh doesn't lose data
        const updatedShop = {
            ...shop,
            businessName: form.businessName || shop.businessName,
            shopDetails: {
                address: form.address,
                openingHours: form.openingHours,
                closingDays: form.closingDays,
                receptionNumber: form.receptionNumber,
                about: form.about,
                instagram: form.instagram,
            }
        };
        localStorage.setItem('shop', JSON.stringify(updatedShop));

        setSuccess(true);
        setForm({ ...form, groqApiKey: '' });
        setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
        setError(err.response?.data?.error || 'Update failed');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-white text-2xl font-bold">Settings</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Configure your shop and AI settings
                </p>
            </div>

            {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle size={16} />
                    Settings updated successfully!
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Business Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                    <Building size={18} className="text-green-400" />
                    Business Info
                </h2>

                <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Business Name</label>
                    <input
                        type="text"
                        value={form.businessName}
                        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-gray-400 text-sm">WhatsApp Number</label>
                    <div className="relative">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="919XXXXXXXXX"
                            value={form.whatsappNumber}
                            onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                    <p className="text-gray-500 text-xs">
                        Format: 91XXXXXXXXXX (country code + number)
                    </p>
                </div>
            </div>

            {/* AI Configuration */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                    <Key size={18} className="text-green-400" />
                    AI Configuration
                </h2>

                <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Groq API Key</label>
                    <div className="relative">
                        <input
                            type={showGroqKey ? 'text' : 'password'}
                            placeholder="gsk_••••••••••••••••••••••"
                            value={form.groqApiKey}
                            onChange={(e) => setForm({ ...form, groqApiKey: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
                        />
                        <button
                            onClick={() => setShowGroqKey(!showGroqKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showGroqKey ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                    <p className="text-gray-500 text-xs">
                        Get your free key at{' '}
                        
                            href="https://console.groq.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-400 hover:text-green-300"
                        <a>
                            console.groq.com
                        </a>
                        {' '}— your key, your AI cost
                    </p>
                </div>

                {/* Info box */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-blue-400 text-xs">
                        💡 Your Groq key is encrypted and used only to power your shop's AI replies.
                        Groq's free tier gives you millions of tokens — more than enough for a barber shop.
                    </p>
                </div>
            </div>
            {/* Shop Details */}
<div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
    <h2 className="text-white font-semibold flex items-center gap-2">
        <Building size={18} className="text-green-400" />
        Shop Details
    </h2>

    <div className="space-y-2">
        <label className="text-gray-400 text-sm">Address</label>
        <input
            type="text"
            placeholder="123, Main Market, Rohtak"
            value={form.address || ''}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
        />
    </div>

    <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
            <label className="text-gray-400 text-sm">Opening Hours</label>
            <input
                type="text"
                placeholder="9AM - 9PM"
                value={form.openingHours || ''}
                onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
        </div>
        <div className="space-y-2">
            <label className="text-gray-400 text-sm">Closed On</label>
            <input
                type="text"
                placeholder="Sunday"
                value={form.closingDays || ''}
                onChange={(e) => setForm({ ...form, closingDays: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
            />
        </div>
    </div>

    <div className="space-y-2">
        <label className="text-gray-400 text-sm">Reception Number</label>
        <input
            type="text"
            placeholder="919XXXXXXXXX"
            value={form.receptionNumber || ''}
            onChange={(e) => setForm({ ...form, receptionNumber: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
        />
    </div>

    <div className="space-y-2">
        <label className="text-gray-400 text-sm">About Shop</label>
        <textarea
            rows={3}
            placeholder="Premium salon in Rohtak, specializing in modern haircuts..."
            value={form.about || ''}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors resize-none"
        />
    </div>

    <div className="space-y-2">
        <label className="text-gray-400 text-sm">Instagram Handle</label>
        <input
            type="text"
            placeholder="@rajassalon"
            value={form.instagram || ''}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
        />
    </div>
</div>

            {/* Save */}
            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
                {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                    : <><SettingsIcon size={15} /> Save Settings</>
                }
            </button>

            {/* Danger Zone */}
            <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6 space-y-3">
                <h2 className="text-red-400 font-semibold text-sm">Danger Zone</h2>
                <p className="text-gray-400 text-xs">
                    Disconnecting WhatsApp will stop all automation until you reconnect.
                </p>
                <button
    onClick={handleDisconnect}
    disabled={disconnecting}
    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
>
    {disconnecting
        ? <><Loader2 size={14} className="animate-spin" /> Disconnecting...</>
        : 'Disconnect WhatsApp'
    }
</button>
            </div>
        </div>
    );
}