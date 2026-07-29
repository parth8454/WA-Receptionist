import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeads, updateLeadStatus, deleteLead } from '../services/api';
import { Phone, CheckCircle, Clock, User, Loader2, Calendar, Trash2 } from 'lucide-react';

export default function Leads() {
    const { shop } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('new');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const res = await getLeads(shop.id);
            setLeads(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
    try {
        await deleteLead(id);
        setLeads(leads.filter(l => l._id !== id));
    } catch (err) {
        console.error(err);
    }
};

    const handleStatus = async (id, status) => {
        try {
            await updateLeadStatus(id, { status });
            setLeads(leads.map(l => l._id === id ? { ...l, status } : l));
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = leads.filter(l => filter === 'all' ? true : l.status === filter);

    const counts = {
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        done: leads.filter(l => l.status === 'done').length,
    };

    const formatPhone = (phone) => {
        // 919306439483@s.whatsapp.net → +91 93064 39483
        const num = phone.replace('@s.whatsapp.net', '').replace('@lid', '');
        return `+${num.slice(0, 2)} ${num.slice(2, 7)} ${num.slice(7)}`;
    };

    const callCustomer = (phone) => {
        const num = phone.replace('@s.whatsapp.net', '').replace('@lid', '');
        window.open(`tel:+${num}`);
    };

    const whatsappCustomer = (phone) => {
        const num = phone.replace('@s.whatsapp.net', '').replace('@lid', '');
        window.open(`https://wa.me/${num}`);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-white text-2xl font-bold">Leads</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Customers who requested appointments
                </p>
            </div>

            <div>
                <button onClick={fetchLeads} placeholder="Search" className="bg-green-500 hover:bg-green-400 disabled:bg-green-500/30 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">Fetch Leads</button>
            </div>

            {/* Actions */}


            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'New', count: counts.new, color: 'blue' },
                    { label: 'Contacted', count: counts.contacted, color: 'yellow' },
                    { label: 'Done', count: counts.done, color: 'green' },
                ].map(({ label, count, color }) => (
                    <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                        <p className={`text-2xl font-bold
                            ${color === 'blue' ? 'text-blue-400' : ''}
                            ${color === 'yellow' ? 'text-yellow-400' : ''}
                            ${color === 'green' ? 'text-green-400' : ''}
                        `}>{count}</p>
                        <p className="text-gray-400 text-xs mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {['new', 'contacted', 'done', 'all'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors
                            ${filter === f
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Leads List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={24} className="animate-spin text-green-400" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Calendar size={32} className="text-gray-600" />
                        <p className="text-gray-400 text-sm">
                            No {filter === 'all' ? '' : filter} leads yet
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {filtered.map((lead) => (
                            <div key={lead._id} className="px-6 py-4">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 shrink-0 mt-2 md:mt-0">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 shrink-0 mt-2 md:mt-0">
                                        <div className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                            <User size={16} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">
                                                {formatPhone(lead.customerPhone)}
                                            </p>
                                            <p className="text-gray-400 text-xs mt-0.5 max-w-md">
                                                "{lead.query}"
                                            </p>
                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 shrink-0 mt-2 md:mt-0">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                                    ${lead.status === 'new' ? 'bg-blue-500/10 text-blue-400' : ''}
                                                    ${lead.status === 'contacted' ? 'bg-yellow-500/10 text-yellow-400' : ''}
                                                    ${lead.status === 'done' ? 'bg-green-500/10 text-green-400' : ''}
                                                `}>
                                                    {lead.status === 'new' && <span className="flex items-center gap-1"><Clock size={10} /> New</span>}
                                                    {lead.status === 'contacted' && <span className="flex items-center gap-1"><Phone size={10} /> Contacted</span>}
                                                    {lead.status === 'done' && <span className="flex items-center gap-1"><CheckCircle size={10} /> Done</span>}
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                <div className="flex items-center gap-2 shrink-0">
    <button
        onClick={() => whatsappCustomer(lead.customerPhone)}
        className="bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
    >
        <Phone size={12} />
        WhatsApp
    </button>

    {lead.status === 'new' && (
        <button
            onClick={() => handleStatus(lead._id, 'contacted')}
            className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        >
            Mark Contacted
        </button>
    )}

    {lead.status === 'contacted' && (
        <button
            onClick={() => handleStatus(lead._id, 'done')}
            className="bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
        >
            <CheckCircle size={12} />
            Mark Done
        </button>
    )}

    {/* Delete button */}
        <button
            onClick={() => handleDelete(lead._id)}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded-lg transition-colors"
        >
            <Trash2 size={14} />
            </button>
            </div>  
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}