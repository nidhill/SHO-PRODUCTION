import { Link } from 'react-router-dom';
import {
    GraduationCap, Mail, ArrowLeft, Users, BarChart3, CalendarCheck,
    ClipboardList, MessageSquare, School, Shield, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
    {
        icon: Users,
        title: 'Student Tracking',
        desc: "Monitor every student's progress, attendance, and performance in real time.",
        color: 'text-blue-500 bg-blue-500/10',
    },
    {
        icon: CalendarCheck,
        title: 'Attendance Management',
        desc: 'Mark and track daily attendance with auto-calculated percentages.',
        color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
        icon: ClipboardList,
        title: 'Tasks & Assignments',
        desc: 'Assign, track, and review tasks for each batch with completion rates.',
        color: 'text-violet-500 bg-violet-500/10',
    },
    {
        icon: MessageSquare,
        title: 'Student Feedback',
        desc: 'Collect structured feedback to guide student improvement.',
        color: 'text-amber-500 bg-amber-500/10',
    },
    {
        icon: BarChart3,
        title: 'Analytics Dashboard',
        desc: 'Get school-wide insights with visual analytics and performance reports.',
        color: 'text-pink-500 bg-pink-500/10',
    },
    {
        icon: School,
        title: 'Multi-School Support',
        desc: 'Manage Tech, Marketing, Design, Finance & Coding schools from one platform.',
        color: 'text-orange-500 bg-orange-500/10',
    },
];

const roles = [
    { role: 'SHO', desc: 'Manages assigned batches and student data' },
    { role: 'SSHO', desc: 'Oversees SHOs and school-level operations' },
    { role: 'Academic Lead', desc: 'Responsible for academic standards' },
    { role: 'Project Lead', desc: 'Manages project deliverables and teams' },
    { role: 'Mentor', desc: 'Guides and coaches student groups' },
    { role: 'Leadership', desc: 'Full oversight across all schools' },
];

export default function ContactAdmin() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1426] to-[#0a0f1e] text-white">
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white/[0.03] backdrop-blur-md border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-white tracking-wide text-sm uppercase">HACA · SHO App</span>
                    </div>
                    <Link to="/login">
                        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Login
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-400 mb-6 tracking-wide uppercase">
                    <Shield className="h-3.5 w-3.5" /> Academic Management Platform
                </div>

                <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.07] mb-6">
                    Empowering Academic
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent">
                        Excellence at HACA
                    </span>
                </h1>
                <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed mb-10">
                    The SHO App is the all-in-one management platform used by Haris &amp; Co Academy
                    to track student progress, manage batches, and coordinate staff across all schools.
                </p>

                {/* CTA */}
                <a href="mailto:projectshaca@gmail.com?subject=SHO App Access Request&body=Hi,%0A%0AI would like to request access to the SHO App.%0A%0AName:%0ARole:%0ASchool:%0A%0AThank you.">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 gap-2 h-13 px-8 text-base font-semibold rounded-xl">
                        <Mail className="h-5 w-5" /> Request Access
                    </Button>
                </a>
            </section>

            {/* Features Grid */}
            <section className="max-w-6xl mx-auto px-6 pb-20">
                <div className="text-center mb-12">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">Platform Features</p>
                    <h2 className="text-3xl font-bold text-white">Everything in one place</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f) => {
                        const Icon = f.icon;
                        return (
                            <div
                                key={f.title}
                                className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-300 group"
                            >
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color} transition-transform group-hover:scale-110`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-white mb-1.5">{f.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Roles Section */}
            <section className="max-w-6xl mx-auto px-6 pb-20">
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-10">
                    <div className="text-center mb-10">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">Who Uses SHO App</p>
                        <h2 className="text-3xl font-bold text-white">Role-Based Access</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roles.map((r) => (
                            <div key={r.role} className="flex items-start gap-3 bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                                <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-white">{r.role}</p>
                                    <p className="text-xs text-white/50 mt-0.5">{r.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Card */}
            <section className="max-w-6xl mx-auto px-6 pb-24">
                <div className="rounded-3xl overflow-hidden relative bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-blue-800/20 border border-blue-500/20 p-12 text-center">
                    {/* Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)]" />
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Mail className="h-8 w-8 text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">Need Access?</h2>
                        <p className="text-white/60 mb-8 max-w-md mx-auto">
                            Contact the HACA administration team to get your account created.
                            Include your name, role, and which school you belong to.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                            <a
                                href="mailto:projectshaca@gmail.com?subject=SHO App Access Request&body=Hi,%0A%0AI would like to request access to the SHO App.%0A%0AName:%0ARole:%0ASchool:%0A%0AThank you."
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 text-sm"
                            >
                                <Mail className="h-4 w-4" />
                                projectshaca@gmail.com
                            </a>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            Usually responds within 24 hours
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/[0.06] py-8">
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                            <GraduationCap className="h-3.5 w-3.5 text-white" />
                        </div>
                        © 2024 HACA · SHO App. All rights reserved.
                    </div>
                    <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        projectshaca@gmail.com
                    </div>
                </div>
            </footer>
        </div>
    );
}
