import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectWhatsApp } from '../services/api';
import {
    Wifi, WifiOff, QrCode, Users,
    MessageSquare, Loader2, RefreshCw
} from 'lucide-react';

export default function Dashboard() {
    const { shop } = useAuth();
    const [connected, setConnected] = useState(false);
    const [qr, setQr] = useState(null);
    const [loadingQR, setLoadingQR] = useState(false);
    const [stats] = useState({
        totalCustomers: 0,
        messagesToday: 0,
        appointmentsToday: 0
    });
    const eventSourceRef = useRef(null);

    const startQRConnection = () => {
        setLoadingQR(true);
        setQr(null);

        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const token = localStorage.getItem('token');

        const es = new EventSource(
            `http://localhost:3000/api/v1/shop/connect/${shop.id}?token=${token}`
        );

        es.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.qr) {
                setQr(data.qr);
                setLoadingQR(false);
            }

            if (data.status === 'connected') {
                setConnected(true);
                setQr(null);
                setLoadingQR(false);
                es.close();
            }

            if (data.status === 'already_connected') {
                setConnected(true);
                setLoadingQR(false);
                es.close();
            }
        };

        es.onerror = () => {
            setLoadingQR(false);
            es.close();
        };

        eventSourceRef.current = es;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-white text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Welcome back, {shop?.businessName}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'blue' },
                    { label: 'Messages Today', value: stats.messagesToday, icon: MessageSquare, color: 'green' },
                    { label: 'Appointments Today', value: stats.appointmentsToday, icon: QrCode, color: 'purple' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 md:p-4">
                        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center mb-2 md:mb-3 ...`}>
                            <Icon size={16} className={`
                                ${color === 'blue' ? 'text-blue-400' : ''}
                                ${color === 'green' ? 'text-green-400' : ''}
                                ${color === 'purple' ? 'text-purple-400' : ''}
                            `} />   
                        </div>
                        <p className="text-white text-xl md:text-2xl font-bold">{value}</p>
            <p className="text-gray-400 text-xs mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* WhatsApp Connection */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-white font-semibold">WhatsApp Connection</h2>
                        <p className="text-gray-400 text-sm mt-0.5">
                            Connect your shop's WhatsApp number
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                        ${connected
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                        {connected
                            ? <><Wifi size={12} /> Connected</>
                            : <><WifiOff size={12} /> Disconnected</>
                        }
                    </div>
                </div>

                {/* QR Section */}
                {!connected && (
                    <div className="flex flex-col items-center py-6">
                        {loadingQR && (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={32} className="animate-spin text-green-400" />
                                <p className="text-gray-400 text-sm">Generating QR code...</p>
                            </div>
                        )}

                        {qr && !loadingQR && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-white p-4 rounded-xl">
                                    <img src={qr} alt="QR Code" className="w-48 h-48" />
                                </div>
                                <p className="text-gray-400 text-sm text-center">
                                    Open WhatsApp → Three dots → Linked Devices → Scan QR
                                </p>
                                <button
                                    onClick={startQRConnection}
                                    className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                                >
                                    <RefreshCw size={14} />
                                    Refresh QR
                                </button>
                            </div>
                        )}

                        {!qr && !loadingQR && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center">
                                    <QrCode size={32} className="text-gray-600" />
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Connect your WhatsApp to start automation
                                </p>
                                <button
                                    onClick={startQRConnection}
                                    className="bg-green-500 hover:bg-green-400 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
                                >
                                    <QrCode size={16} />
                                    Connect WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {connected && (
                    <div className="flex flex-col items-center py-6 gap-3">
                        <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center">
                            <Wifi size={32} className="text-green-400" />
                        </div>
                        <p className="text-white font-medium">WhatsApp is connected!</p>
                        <p className="text-gray-400 text-sm">
                            Your bot is live and replying to customers 24/7
                        </p>
                        <button
                            onClick={() => {
                                setConnected(false);
                                startQRConnection();
                            }}
                            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors mt-2"
                        >
                            <RefreshCw size={14} />
                            Reconnect
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}