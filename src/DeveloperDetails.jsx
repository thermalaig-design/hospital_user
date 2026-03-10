import React, { useState } from 'react';
import {
  ChevronLeft, Code2, Database, Palette,
  Mail, Phone, Copy, Check, Home as HomeIcon,
  Smartphone, Shield, Zap, Globe, MapPin
} from 'lucide-react';

const PHONE = '9312234636';
const EMAIL = 'thermal.aig@gmail.com';
const ADDRESS = '4TH FLOOR, C-57, TEI TOWER, WAZIRPUR INDUSTRIAL AREA, New Delhi, North West Delhi, Delhi, 110052';

const team = [
  {
    initials: 'FD',
    name: 'Frontend Developer',
    role: 'React & Mobile App Specialist',
    icon: Code2,
    accent: 'bg-indigo-50 border-indigo-100',
    avatarBg: 'bg-indigo-100',
    avatarText: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-600',
    dot: 'bg-indigo-400',
    description: 'Building responsive, modern UIs and mobile experiences using React and Capacitor.',
    skills: ['React', 'JavaScript', 'Mobile Dev', 'UI/UX'],
  },
  {
    initials: 'BD',
    name: 'Backend Developer',
    role: 'Node.js & API Architect',
    icon: Database,
    accent: 'bg-emerald-50 border-emerald-100',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-400',
    description: 'Designing scalable APIs, managing databases and server-side performance.',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'REST APIs'],
  },
  {
    initials: 'DS',
    name: 'UI/UX Designer',
    role: 'Design & User Experience',
    icon: Palette,
    accent: 'bg-violet-50 border-violet-100',
    avatarBg: 'bg-violet-100',
    avatarText: 'text-violet-600',
    badgeBg: 'bg-violet-50 text-violet-600',
    dot: 'bg-violet-400',
    description: 'Crafting intuitive, clean designs with focus on usability and user research.',
    skills: ['UI Design', 'Figma', 'Prototyping', 'UX Research'],
  },
];

const techStack = [
  { label: 'React', bg: 'bg-sky-50 text-sky-600' },
  { label: 'JavaScript', bg: 'bg-yellow-50 text-yellow-700' },
  { label: 'Node.js', bg: 'bg-green-50 text-green-700' },
  { label: 'Supabase', bg: 'bg-emerald-50 text-emerald-700' },
  { label: 'Capacitor', bg: 'bg-blue-50 text-blue-700' },
  { label: 'Tailwind CSS', bg: 'bg-cyan-50 text-cyan-700' },
  { label: 'Express.js', bg: 'bg-gray-100 text-gray-600' },
  { label: 'PostgreSQL', bg: 'bg-indigo-50 text-indigo-600' },
];

const features = [
  { icon: Zap, label: 'Fast', bg: 'bg-amber-50', color: 'text-amber-500' },
  { icon: Shield, label: 'Secure', bg: 'bg-green-50', color: 'text-green-500' },
  { icon: Smartphone, label: 'Mobile', bg: 'bg-blue-50', color: 'text-blue-500' },
  { icon: Globe, label: 'Real-time', bg: 'bg-purple-50', color: 'text-purple-500' },
];

const DeveloperDetails = ({ onNavigateBack, onNavigate }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyText = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') { setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000); }
      else if (type === 'phone') { setCopiedPhone(true); setTimeout(() => setCopiedPhone(false), 2000); }
      else if (type === 'address') { setCopiedAddress(true); setTimeout(() => setCopiedAddress(false), 2000); }
    } catch { }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-4 py-5 flex items-center justify-between sticky top-0 z-50 mt-6">
        <button onClick={onNavigateBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Back</span>
        </button>
        <h1 className="text-base font-bold text-gray-800">Developer Team</h1>
        <button onClick={() => onNavigate('home')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-indigo-500">
          <HomeIcon className="h-5 w-5" />
        </button>
      </div>

      {/* ── Hero ── soft indigo, not blinding */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 px-5 py-8 pb-12 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
          <Code2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white mb-1">MAH SETU</h1>
        <p className="text-indigo-100 text-sm">Maharaja Agrasen Hospital — Official App</p>
        <span className="inline-block mt-3 text-xs text-indigo-200 bg-white/15 px-3 py-1 rounded-full font-medium border border-white/20">
          Version 1.0.0
        </span>
      </div>

      {/* ── White pull-up sheet ── */}
      <div className="bg-gray-50 rounded-t-3xl -mt-5 px-4 pt-5 pb-12 flex-1 space-y-5">

        {/* Feature pills */}
        <div className="grid grid-cols-4 gap-2">
          {features.map(({ icon: Icon, label, bg, color }) => (
            <div key={label} className={`${bg} rounded-2xl py-3 flex flex-col items-center gap-1.5 border border-white`}>
              <Icon className={`h-5 w-5 ${color}`} />
              <span className="text-[10px] font-semibold text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Contact Support ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
            <Phone className="h-4 w-4 text-indigo-500" />
            <div>
              <h2 className="text-sm font-bold text-indigo-800">Contact Support</h2>
              <p className="text-[11px] text-indigo-400">We're here to help anytime</p>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Email */}
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-gray-700 truncate">{EMAIL}</p>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); copyText(EMAIL, 'email'); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${copiedEmail ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600 active:scale-95'
                  }`}
              >
                {copiedEmail ? <><Check className="h-3 w-3" /> Done</> : <><Copy className="h-3 w-3" /> Copy</>}
              </button>
            </a>
            {/* Phone */}
            <a href={`tel:+91${PHONE}`} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Phone</p>
                <p className="text-sm font-semibold text-gray-700">+91 {PHONE}</p>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); copyText(`+91 ${PHONE}`, 'phone'); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${copiedPhone ? 'bg-green-50 text-green-600' : 'bg-green-50 text-green-600 active:scale-95'
                  }`}
              >
                {copiedPhone ? <><Check className="h-3 w-3" /> Done</> : <><Copy className="h-3 w-3" /> Copy</>}
              </button>
            </a>
            {/* Address */}
            <div className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Address</p>
                <p className="text-sm font-semibold text-gray-700">{ADDRESS}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Team ── */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Our Team</h2>
          <div className="space-y-3">
            {team.map((dev) => (
              <div key={dev.name} className={`rounded-2xl border ${dev.accent} p-5`}>
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 ${dev.avatarBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-sm font-bold ${dev.avatarText}`}>{dev.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm">{dev.name}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{dev.role}</p>
                    <p className="text-gray-500 text-xs mt-2 leading-relaxed">{dev.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {dev.skills.map(skill => (
                        <span key={skill} className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${dev.badgeBg}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 text-center shadow-sm">
          <p className="text-sm font-bold text-gray-700 mb-1">MAH SETU App</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Built for Maharaja Agrasen Hospital to empower<br />patients, trustees & patrons.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            <p className="text-[11px] text-gray-300">© 2026 Maharaja Agrasen Hospital</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeveloperDetails;