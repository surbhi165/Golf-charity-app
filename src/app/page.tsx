import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar Updated with Admin Route */}
<nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
  <div className="text-2xl font-black italic text-indigo-600">GOLF CHARITY 🏌️‍♂️</div>
  <div className="flex items-center gap-6">
    {/* Admin Link (Sirf aapke liye) */}
    <Link href="/admin/login" className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
      Admin Panel
    </Link>
    <Link href="/signup" className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-600 transition-all">
      Get Started
    </Link>
  </div>
</nav>

      {/* 2. Hero Section (Section 1) */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
          Win Big while <span className="text-indigo-600">Giving Back.</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 leading-relaxed">
          The ultimate golf platform where 10% of every entry supports global charities. 
          Upload your scores, join the draw, and make an impact.
        </p>
        <Link href="/signup" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-indigo-200 hover:scale-105 transition-all inline-block">
          Join the Next Draw 🏆
        </Link>
      </section>

      {/* 3. Stats Section (Section 2 - Real Data Logic) */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-5xl font-black text-indigo-600 mb-2">$20.00</p>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">Monthly Prize Pool</p>
          </div>
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-5xl font-black text-green-500 mb-2">10%</p>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">Direct Charity Impact</p>
          </div>
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-5xl font-black text-slate-900 mb-2">5/5</p>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">Score Verification</p>
          </div>
        </div>
      </section>

      {/* 4. Footer CTA (Section 4) */}
      <section className="py-32 px-6 text-center">
        <div className="bg-indigo-600 rounded-[3rem] p-16 text-white max-w-5xl mx-auto relative overflow-hidden shadow-2xl">
          <h2 className="text-4xl font-black mb-6 relative z-10">Ready to tee off for a cause?</h2>
          <Link href="/signup" className="bg-white text-indigo-600 px-12 py-4 rounded-2xl font-black text-lg relative z-10 hover:bg-slate-100 transition-colors">
            Create Free Account
          </Link>
          <div className="absolute -bottom-10 -right-10 text-[15rem] opacity-10 rotate-12">🏌️</div>
        </div>
      </section>
    </div>
  );
}