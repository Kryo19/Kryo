import { useState } from "react";
import { CheckCircle2, TrendingUp, Shield, Zap, Globe, Users, DollarSign } from "lucide-react";

const API = "http://localhost:3000/api";

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  return res.json();
}

export default function InvestorPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/inquiries", {
        method: "POST",
        body: JSON.stringify({ ...form, type: "investor", message: form.message || "Investor inquiry" }),
      });
      setDone(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="k-app min-h-screen text-[#e9fff4]">
      <div className="noise" />
      <div className="scanline" />
      <div className="relative z-10">

        {/* Hero */}
        <section className="border-b border-[#0f2d1d] px-6 py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-[rgba(34,255,153,0.2)] bg-[rgba(34,255,153,0.05)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#22ff99] mb-8">
              Investor Relations
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
              The Future of<br /><span className="text-[#22ff99]">Cold Chain Intelligence</span>
            </h1>
            <p className="mt-6 text-lg text-[#a8b9ad] max-w-2xl mx-auto">
              KRYO is building the AI-native molecular surveillance platform for pharmaceutical cold chains and perishable cargo. We prevent billions in cargo loss annually.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-[#8fa597]">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#22ff99]" />Live Product</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#22ff99]" />Real Users</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#22ff99]" />Working Database</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#22ff99]" />Founder-built</span>
            </div>
          </div>
        </section>

        {/* Market Stats */}
        <section className="border-b border-[#0f2d1d] px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-black text-white mb-12">The Problem is Massive</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { value: "$340B", label: "Global cold chain market size", icon: Globe },
                { value: "$35B", label: "Lost annually to temperature excursions", icon: TrendingUp },
                { value: "25%", label: "Of vaccines wasted due to cold chain failure", icon: Shield },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="k-panel p-8 text-center">
                  <Icon size={28} className="mx-auto text-[#22ff99] mb-4" />
                  <div className="text-5xl font-light text-[#22ff99] mb-3">{value}</div>
                  <div className="text-sm text-[#8fa597]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product */}
        <section className="border-b border-[#0f2d1d] px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-black text-white mb-12">What KRYO Does</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { icon: Zap, title: "Real-time Molecular Monitoring", desc: "FT-NIR spectroscopy and IoT sensors track temperature, humidity, ethylene, and CO2 continuously throughout the shipment journey." },
                { icon: Shield, title: "AI-Powered Compliance", desc: "Machine learning models predict shelf life degradation and flag compliance issues before they become cargo losses." },
                { icon: Globe, title: "Route Intelligence", desc: "Interactive maps show live shipment routes with weather overlays and optimization suggestions for every delivery." },
                { icon: Users, title: "Multi-stakeholder Platform", desc: "Pharma companies, logistics managers, and regulators all get role-specific dashboards with the data they need." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="k-panel p-6 flex gap-4">
                  <Icon size={24} className="text-[#22ff99] flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-white mb-2">{title}</div>
                    <div className="text-sm text-[#8fa597]">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Business Model */}
        <section className="border-b border-[#0f2d1d] px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-black text-white mb-12">Business Model</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: DollarSign, title: "SaaS Subscription", desc: "Monthly per-user pricing for dashboard access and monitoring. $99-$499/month per organization." },
                { icon: Zap, title: "Per-Shipment Monitoring", desc: "Pay-per-use model for companies with irregular shipment volumes. $2-$10 per monitored shipment." },
                { icon: Shield, title: "Enterprise Contracts", desc: "Annual contracts with pharmaceutical companies for full fleet monitoring and compliance reporting." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="k-panel p-6 text-center">
                  <Icon size={24} className="mx-auto text-[#22ff99] mb-3" />
                  <div className="font-bold text-white mb-2">{title}</div>
                  <div className="text-sm text-[#8fa597]">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Traction */}
        <section className="border-b border-[#0f2d1d] px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-black text-white mb-12">Traction</h2>
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { value: "Live", label: "Product deployed" },
                { value: "Full", label: "Stack built" },
                { value: "Real", label: "Database & Auth" },
                { value: "0→1", label: "Built in 30 days" },
              ].map(({ value, label }) => (
                <div key={label} className="k-panel p-6 text-center">
                  <div className="text-4xl font-light text-[#22ff99] mb-2">{value}</div>
                  <div className="text-sm text-[#8fa597]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-lg">
            <h2 className="text-center text-3xl font-black text-white mb-4">Get in Touch</h2>
            <p className="text-center text-[#8fa597] mb-8">Interested in investing or partnering with KRYO? We'd love to hear from you.</p>
            {done ? (
              <div className="k-panel p-8 text-center">
                <CheckCircle2 size={48} className="mx-auto text-[#22ff99] mb-4" />
                <div className="text-xl font-bold text-white">Message received!</div>
                <div className="text-[#8fa597] mt-2">We'll be in touch within 24 hours.</div>
              </div>
            ) : (
              <div className="k-panel p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ["Full Name", "name", "text", "John Smith"],
                      ["Email", "email", "email", "john@fund.com"],
                      ["Organization", "company", "text", "Sequoia Capital"],
                      ["Phone", "phone", "text", "+91 98765 43210"],
                    ].map(([label, key, type, placeholder]) => (
                      <label key={key} className="block">
                        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa090]">{label}</span>
                        <input className="k-input" type={type} placeholder={placeholder}
                          value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                      </label>
                    ))}
                  </div>
                  <label className="block">
                    <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#8aa090]">Message</span>
                    <textarea className="k-input min-h-[100px] resize-none" placeholder="Tell us about your investment interest..."
                      value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                  </label>
                  <button className="primary-btn w-full" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
