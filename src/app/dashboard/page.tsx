"use client";
import { useState, useEffect, Suspense } from 'react'; // Suspense add kiya
import { supabase } from '../../lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';

// 1. Asli logic ko ek alag component mein rakhein
function DashboardContent() {
  const [score, setScore] = useState('');
  const [recentScores, setRecentScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  // Check for success & Update Database Status
  useEffect(() => {
    const updateStatus = async () => {
      if (searchParams.get('success') === 'true') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'active' })
            .eq('id', user.id);
          
          setSubscriptionStatus('active');
          setShowSuccess(true);
          
          setTimeout(() => {
            setShowSuccess(false);
            router.replace('/dashboard'); 
          }, 5000);
        }
      }
    };
    updateStatus();
  }, [searchParams, router]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: scores } = await supabase
        .from('golf_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5); 
      setRecentScores(scores || []);

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single();
      if (profile) setSubscriptionStatus(profile.subscription_status);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signup');
  };

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10 }),
      });
      const session = await res.json();
      if (session.url) window.location.href = session.url;
    } catch (err) {
      alert("Payment failed!");
    } finally {
      setIsPaying(false);
    }
  };

  const submitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const numScore = parseInt(score);
    if (numScore < 1 || numScore > 45) return alert("Score 1-45 range mein hona chahiye");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please login!");

    const { data: existing } = await supabase
      .from('golf_scores')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (existing && existing.length >= 5) {
      await supabase.from('golf_scores').delete().eq('id', existing[0].id);
    }

    const { error } = await supabase.from('golf_scores').insert([{ user_id: user.id, score: numScore }]);
    if (!error) {
      setScore('');
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-black font-sans">
      <div className="max-w-2xl mx-auto">
        {showSuccess && (
          <div className="bg-green-500 text-white px-6 py-4 rounded-2xl mb-6 shadow-lg flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-lg">Payment Successful!</p>
              <p className="opacity-90 text-sm">Your subscription is now active.</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Golf Dashboard 🏌️‍♂️</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`h-2 w-2 rounded-full ${subscriptionStatus === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Status: {subscriptionStatus}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={handlePayment}
              disabled={isPaying || subscriptionStatus === 'active'}
              className="bg-slate-900 text-white px-8 py-2.5 rounded-full font-bold shadow-xl hover:bg-black disabled:bg-slate-200"
            >
              {isPaying ? "Processing..." : subscriptionStatus === 'active' ? "Subscribed ✅" : "Subscribe $10"}
            </button>
            <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-500">Logout Account</button>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-3xl p-6 mb-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-indigo-100 font-bold uppercase text-xs tracking-widest mb-1">Monthly Giving Impact</h3>
            <p className="text-3xl font-black">$1.00 <span className="text-lg font-normal opacity-60">/ month</span></p>
            <p className="text-indigo-100 text-sm mt-2 font-medium">10% of your fee goes directly to your cause.</p>
          </div>
          <div className="text-6xl opacity-20 absolute -right-4 -bottom-2 rotate-12">🌟</div>
        </div>
        
        <form onSubmit={submitScore} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <label className="block mb-3 font-bold text-slate-600 text-sm uppercase tracking-wider">Submit Round Score</label>
          <div className="flex gap-4">
            <input 
              type="number" 
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="bg-slate-50 border-none p-4 rounded-2xl flex-1 focus:ring-2 focus:ring-indigo-400 outline-none text-lg font-bold"
              placeholder="Enter Stableford (1-45)"
              required
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold shadow-lg active:scale-95">Save Score</button>
          </div>
        </form>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-black mb-6 text-slate-400 uppercase tracking-widest">Recent Performance (Last 5)</h2>
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div></div>
          ) : (
            <div className="grid gap-3">
              {recentScores.map((s, index) => (
                <div key={s.id} className="flex justify-between items-center bg-slate-50/50 p-5 rounded-2xl border border-slate-50 hover:border-indigo-100 transition-all">
                  <span className="font-bold text-slate-500">Game Record #{recentScores.length - index}</span>
                  <span className="text-2xl font-black text-slate-900">{s.score}</span>
                </div>
              ))}
              {recentScores.length === 0 && <p className="text-center py-10 text-slate-400 italic">No matches recorded yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. Main Page Component jo Suspense Boundary provide karega
export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}