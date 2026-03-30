"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [charityId, setCharityId] = useState('');
  const [charityList, setCharityList] = useState<any[]>([]);
  const [isLogin, setIsLogin] = useState(true); // Default mode Login rakha hai
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Charities fetch karein (Sirf Signup ke waqt dikhane ke liye)
  useEffect(() => {
    const fetchCharities = async () => {
      const { data } = await supabase.from('charities').select('id, name');
      if (data) setCharityList(data);
    };
    fetchCharities();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // --- LOGIN LOGIC ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("Login Error: " + error.message);
      } else if (data.user) {
        router.push('/dashboard'); // Login successful
      }
    } else {
      // --- SIGNUP LOGIC ---
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        setLoading(false);
        return alert(authError.message);
      }

      if (authData.user) {
        // Profiles table mein entry (Only for new users)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: authData.user.id, 
              charity_id: charityId, 
              subscription_status: 'inactive' 
            }
          ]);

        if (profileError) {
          alert("Auth success but profile error: " + profileError.message);
        } else {
          alert("Success! Verification email check karein ya ab login karein.");
          setIsLogin(true); // Signup ke baad Login mode par switch kar do
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 mb-2 text-center italic">
          {isLogin ? "Welcome Back! 🏌️‍♂️" : "Join the Club 🚀"}
        </h2>
        <p className="text-center text-slate-500 mb-8 text-sm">
          {isLogin ? "Enter your details to access your dashboard" : "Create an account to start tracking scores"}
        </p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block mb-1 ml-1 text-xs font-bold text-slate-400 uppercase">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-black transition-all" 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block mb-1 ml-1 text-xs font-bold text-slate-400 uppercase">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-black transition-all" 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          {/* Charity selection sirf Signup ke waqt dikhega */}
          {!isLogin && (
            <div className="animate-in fade-in duration-500">
              <label className="block mb-1 ml-1 text-xs font-bold text-slate-400 uppercase">Select Your Charity</label>
              <select 
                className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 transition-all appearance-none" 
                onChange={(e) => setCharityId(e.target.value)} 
                required
              >
                <option value="">Choose a cause...</option>
                {charityList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}