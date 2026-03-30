
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Yahan apna email/password set karein
    if (email === "admin@golf.com" && password === "Admin@123") {
      localStorage.setItem('isAdmin', 'true');
      router.push('/admin'); 
    } else {
      alert("Invalid Admin Credentials!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <form onSubmit={handleLogin} className="bg-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700">
        <h2 className="text-3xl font-black mb-6 text-center text-indigo-400">Admin Login 🔒</h2>
        <input 
          type="email" 
          placeholder="Admin Email" 
          className="w-full p-4 mb-4 rounded-2xl bg-slate-700 border-none outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-4 mb-6 rounded-2xl bg-slate-700 border-none outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-indigo-600 p-4 rounded-2xl font-black hover:bg-indigo-700 transition-all">
          Login to Dashboard
        </button>
      </form>
    </div>
  );
}