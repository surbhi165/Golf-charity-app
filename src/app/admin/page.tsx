"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation'; // Router import kiya

export default function AdminDashboard() {
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [newCharity, setNewCharity] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Security Check: Kya user login hai?
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.push('/admin/login'); // Agar login nahi hai toh redirect karein
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Users & Profiles
    const { data: profiles } = await supabase.from('profiles').select('*');
    if (profiles) {
      setUsers(profiles);
      const active = profiles.filter(p => p.subscription_status === 'active').length;
      setActiveUsersCount(active);
    }

    // Fetch Winners (draw_winners table)
    const { data: winnersData } = await supabase
      .from('draw_winners')
      .select('*')
      .order('created_at', { ascending: false });
    setWinners(winnersData || []);
    setLoading(false);
  };

  // PRD Tier Logic
  const totalPool = activeUsersCount * 10;
  const tier5 = (totalPool * 0.40).toFixed(2);
  const tier4 = (totalPool * 0.35).toFixed(2);
  const tier3 = (totalPool * 0.25).toFixed(2);
  const charityTotal = (totalPool * 0.10).toFixed(2);

  const handleVerify = async (id: string, status: 'Paid' | 'Rejected') => {
    const { error } = await supabase
      .from('draw_winners')
      .update({ payment_status: status })
      .eq('id', id);
    if (!error) {
      alert(`Winner marked as ${status}`);
      fetchData();
    }
  };

  const addCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('charities').insert([newCharity]);
    if (!error) {
      alert("Charity added successfully!");
      setNewCharity({ name: '', description: '' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/admin/login');
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-bold">Verifying Admin Access...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-5">
          <h1 className="text-4xl font-black italic">Admin Control Panel ⚙️</h1>
          <button 
            onClick={handleLogout}
            className="text-xs font-bold text-slate-400 hover:text-red-500 border border-slate-700 px-4 py-2 rounded-xl transition-all"
          >
            Logout Admin
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Prize Pool</p>
            <p className="text-5xl font-black mt-2 text-green-400">${totalPool}</p>
          </div>
          <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Charity Pool (10%)</p>
            <p className="text-5xl font-black mt-2 text-blue-400">${charityTotal}</p>
          </div>
          <div className="bg-orange-600 p-8 rounded-3xl flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs font-bold uppercase">Monthly Draw</p>
              <p className="text-2xl font-black text-white italic">Execution Ready</p>
            </div>
            <button className="bg-white text-orange-600 px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all">Run Now</button>
          </div>
        </div>

        {/* Tier Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-center">
          <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">5-Match (40%)</span>
            <p className="text-2xl font-black text-green-400">${tier5}</p>
          </div>
          <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">4-Match (35%)</span>
            <p className="text-2xl font-black text-slate-200">${tier4}</p>
          </div>
          <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">3-Match (25%)</span>
            <p className="text-2xl font-black text-slate-200">${tier3}</p>
          </div>
        </div>

        {/* Winner Verification Section */}
        <div className="bg-slate-800/50 rounded-[2rem] overflow-hidden border border-slate-700 mb-8">
          <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold uppercase text-sm tracking-widest">Winner Verification</h3>
            <span className="bg-blue-500 text-[10px] px-2 py-1 rounded-full font-bold">{winners.length} PENDING</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase border-b border-slate-700 font-black">
                  <th className="p-6">Winner ID</th>
                  <th className="p-6">Tier</th>
                  <th className="p-6">Proof</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {winners.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="p-6 font-mono text-[11px] text-slate-400">{w.user_id?.slice(0,8)}...</td>
                    <td className="p-6 text-sm font-bold text-orange-400">{w.tier}-Match</td>
                    <td className="p-6">
                      <a href={w.proof_url} target="_blank" className="text-blue-400 text-xs underline font-bold">View Screenshot</a>
                    </td>
                    <td className="p-6 text-right space-x-2">
                      <button onClick={() => handleVerify(w.id, 'Paid')} className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-green-500 hover:text-white transition-all">Approve</button>
                      <button onClick={() => handleVerify(w.id, 'Rejected')} className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all">Reject</button>
                    </td>
                  </tr>
                ))}
                {winners.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-slate-500 italic text-sm">No pending verifications.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charity Management */}
        <div className="bg-slate-800/50 rounded-[2rem] p-8 border border-slate-700 mb-8">
          <h3 className="font-bold uppercase text-sm tracking-widest mb-6">Add New Charity Organization</h3>
          <form onSubmit={addCharity} className="flex flex-col md:flex-row gap-4">
            <input 
              value={newCharity.name}
              onChange={(e) => setNewCharity({...newCharity, name: e.target.value})}
              placeholder="Charity Name" 
              className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex-1 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
            <input 
              value={newCharity.description}
              onChange={(e) => setNewCharity({...newCharity, description: e.target.value})}
              placeholder="Short Description" 
              className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex-[2] outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95">
              Save Charity
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}