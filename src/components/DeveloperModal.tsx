import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Mail, ExternalLink, Briefcase, Info, Sparkles, CheckCircle } from 'lucide-react';
import logoImg from '../assets/hm_innovations.jpg';

interface DeveloperInfo {
  nameEn: string;
  nameBn: string;
  logoUrl: string;
  website: string;
  email: string;
  taglineBn: string;
  taglineEn: string;
  descriptionBn: string;
  descriptionEn: string;
  servicesBn: string[];
}

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  developer: DeveloperInfo;
}

export function DeveloperModal({ isOpen, onClose, developer }: DeveloperModalProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'contact'>('about');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto no-print">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-2xl bg-white/90 dark:bg-darkBg-darkest/95 border border-gray-200/50 dark:border-gray-800/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md max-h-[90vh] flex flex-col z-10"
          >
            {/* Top Innovative Accent Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-darkBg-light dark:hover:bg-darkBg-dark text-gray-500 dark:text-gray-400 transition-colors z-20"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto flex-grow p-6 sm:p-8 space-y-6 scrollbar-thin">
              
              {/* Header Branding Panel */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800/60 text-center sm:text-left">
                {/* Logo Frame with Glow */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500" />
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white border border-gray-200 dark:border-gray-800 shadow-lg">
                    <img 
                      src={logoImg} 
                      alt={developer.nameEn} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                    />
                  </div>
                </div>

                <div className="space-y-2 flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-white font-siliguri tracking-tight">
                      {developer.nameBn}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 max-w-fit mx-auto sm:mx-0">
                      {developer.nameEn}
                    </span>
                  </div>
                  <p className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent font-siliguri">
                    {developer.taglineBn}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium font-sans">
                    {developer.taglineEn}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex bg-gray-100 dark:bg-darkBg-light/40 rounded-2xl p-1 border border-gray-200/50 dark:border-gray-800/80 font-bold text-xs sm:text-sm">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex-1 py-2.5 rounded-xl font-siliguri flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'about'
                      ? 'bg-white dark:bg-darkBg-dark shadow-md text-emerald-600 dark:text-emerald-400 font-extrabold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  আমাদের পরিচিতি
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex-1 py-2.5 rounded-xl font-siliguri flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'services'
                      ? 'bg-white dark:bg-darkBg-dark shadow-md text-emerald-600 dark:text-emerald-400 font-extrabold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  আমাদের সেবাসমূহ
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`flex-1 py-2.5 rounded-xl font-siliguri flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'contact'
                      ? 'bg-white dark:bg-darkBg-dark shadow-md text-emerald-600 dark:text-emerald-400 font-extrabold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  যোগাযোগ করুন
                </button>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[160px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {activeTab === 'about' && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 text-center sm:text-left"
                    >
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-siliguri">
                        {developer.descriptionBn}
                      </p>
                      <div className="h-px bg-gray-150 dark:bg-gray-800 my-4" />
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-sans italic">
                        {developer.descriptionEn}
                      </p>
                    </motion.div>
                  )}

                  {activeTab === 'services' && (
                    <motion.div
                      key="services"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {developer.servicesBn.map((service, i) => (
                        <div 
                          key={i} 
                          className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-darkBg-light/10 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all"
                        >
                          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-250 font-siliguri leading-snug">
                            {service}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'contact' && (
                    <motion.div
                      key="contact"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Website Card */}
                        <a 
                          href={developer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 hover:border-emerald-500/30 hover:shadow-md hover:scale-[1.02] transition-all group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">ওয়েবসাইট</span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 font-mono break-all flex items-center gap-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {developer.website.replace('https://', '')}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </a>

                        {/* Email Card */}
                        <a 
                          href={`mailto:${developer.email}`}
                          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkBg-light/20 hover:border-emerald-500/30 hover:shadow-md hover:scale-[1.02] transition-all group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">ইমেইল</span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 font-mono break-all flex items-center gap-1 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                              {developer.email}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </a>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
                        <p className="text-xs text-amber-800 dark:text-amber-400 font-siliguri">
                          আপনার কাস্টম সফটওয়্যার বা ডিজিটাল আইডেন্টিটি সংক্রান্ত যেকোনো আইডিয়া বাস্তবায়নে আমাদের সাথে আজই যোগাযোগ করুন!
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-darkBg-light/30 border-t border-gray-150 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left text-xs text-gray-400 dark:text-gray-500">
              <span className="font-siliguri">
                © {new Date().getFullYear()} {developer.nameBn}। সর্বস্বত্ব সংরক্ষিত।
              </span>
              <span className="font-siliguri text-[10px] sm:text-xs">
                উদ্ভাবনী ও নির্ভরযোগ্য প্রযুক্তির নির্ভরযোগ্য অংশীদার
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
