import { 
  Coins, Users, Compass, Flame, Heart, Wheat, ArrowRight, Sparkles 
} from 'lucide-react';

import { motion } from 'framer-motion';

interface ToolCardConfig {
  id: string;
  name: string;
  tagline: string;
  icon: any;
  color: string;
  popular?: boolean;
}

interface DashboardProps {
  onSelectTool: (toolId: string) => void;
}

export function Dashboard({ onSelectTool }: DashboardProps) {
  const tools: ToolCardConfig[] = [
    {
      id: 'zakat',
      name: 'যাকাত ক্যালকুলেটর',
      tagline: 'আপনার সঞ্চিত যাকাতযোগ্য সম্পদের হিসাব করুন এবং নিসাব যাচাই করুন।',
      icon: Coins,
      color: 'from-emerald-500/20 to-teal-500/10 dark:from-emerald-950/30 dark:to-teal-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
      popular: true
    },
    {
      id: 'miras',
      name: 'মীরাস (উত্তরাধিকার)',
      tagline: 'সুন্নি হানাফি আইনানুযায়ী মৃত ব্যক্তির সম্পত্তির সঠিক হিস্যা বণ্টন করুন।',
      icon: Users,
      color: 'from-blue-500/20 to-indigo-500/10 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-500/30 text-blue-700 dark:text-blue-400',
      popular: true
    },
    {
      id: 'hajj',
      name: 'হজ্জ প্ল্যানার ও যোগ্যতা',
      tagline: 'হজ্জ ফরজ হওয়ার আর্থিক ও শারীরিক সামর্থ্য পরীক্ষা ও ব্যয়ের পরিকল্পনা।',
      icon: Compass,
      color: 'from-amber-500/20 to-gold-500/10 dark:from-amber-950/30 dark:to-gold-950/20 border-gold-500/30 text-amber-700 dark:text-gold-500',
      popular: true
    },
    {
      id: 'fitra',
      name: 'সাদকাতুল ফিতর',
      tagline: 'পরিবারের সদস্য অনুযায়ী সর্বনিম্ন ও সর্বোচ্চ ফিতরার সঠিক হিসাব করুন।',
      icon: Heart,
      color: 'from-rose-500/20 to-pink-500/10 dark:from-rose-950/30 dark:to-pink-950/20 border-rose-500/30 text-rose-700 dark:text-rose-400'
    },
    {
      id: 'qurbani',
      name: 'কুরবানী যোগ্যতা ও হিসাব',
      tagline: 'আপনার উপর কুরবানী ওয়াজিব কি না এবং পশুর শেয়ারের খরচ হিসাব করুন।',
      icon: Flame,
      color: 'from-orange-500/20 to-red-500/10 dark:from-orange-950/30 dark:to-red-950/20 border-orange-500/30 text-orange-700 dark:text-orange-400'
    },
    {
      id: 'ushr',
      name: 'উশর (ফসলের যাকাত)',
      tagline: 'কৃষি জমি ও সেচের ধরণ অনুযায়ী উৎপাদিত ফসলের ফসলি যাকাত নির্ণয়।',
      icon: Wheat,
      color: 'from-lime-500/20 to-emerald-500/10 dark:from-lime-950/30 dark:to-emerald-950/20 border-lime-500/30 text-lime-700 dark:text-lime-400'
    },
    {
      id: 'masturat',
      name: 'মাস্তুরাত সংক্রান্ত',
      tagline: 'মহিলাদের বিশেষ দিনসমূহ ও পবিত্রতার সঠিক মেয়াদ এবং আনুষঙ্গিক শারীরিক অবস্থা নির্ণয়।',
      icon: Sparkles,
      color: 'from-pink-500/20 to-rose-500/10 dark:from-pink-950/30 dark:to-rose-950/20 border-rose-500/30 text-pink-700 dark:text-pink-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Premium minimal header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/50 dark:border-gray-800/50 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-siliguri tracking-tight">
            দ্বীনি হিসাব ড্যাশবোর্ড
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-siliguri mt-1">
            সঠক ও বিশুদ্ধ হিসাব সম্পাদন করতে নিচের যেকোনো মডিউল ব্যবহার করুন
          </p>
        </div>
        <span className="inline-flex self-start sm:self-auto px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/10 dark:border-emerald-500/20 font-siliguri">
          হিজরি বছর: ১৪৪৭ হি.
        </span>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              whileHover={{ y: -5 }}
              className={`relative flex flex-col justify-between p-6 rounded-2xl border bg-white dark:bg-darkBg-light/40 shadow-sm hover:shadow-md transition-all group cursor-pointer ${
                tool.popular ? 'ring-2 ring-emerald-600/10 border-emerald-600/30' : 'border-gray-200/50 dark:border-gray-800/50'
              }`}
              onClick={() => onSelectTool(tool.id)}
            >
              <div className="space-y-4">
                {/* Icon Wrapper */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br border ${tool.color}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white font-siliguri group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-siliguri">
                    {tool.tagline}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-auto flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:gap-1.5 transition-all font-siliguri">
                হিসাব ও যাচাই করুন
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
