
import React, { useState, useEffect } from 'react';
import { DB } from '../../services/db';
import { Submission, Quiz } from '../../types';
import { translations } from '../../translations';
import { getAlgeriaNow, formatToAlgeriaTime } from '../../utils/time';

const StudentDashboard: React.FC = () => {
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [phone, setPhone] = useState('');
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Defaulting to Arabic or English based on common usage
  const lang = 'ar'; 
  const t = translations[lang];
  const isRTL = true;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fName || !lName || !phone) return;
    
    setLoading(true);
    try {
      const data = await DB.getSubmissionsByIdentity(fName, lName, phone);
      if (data.length === 0) {
        setError(lang === 'ar' ? "لم يتم العثور على سجلات بهذه البيانات." : "No records found with these details.");
      } else {
        setSubmissions(data);
        const quizMap: Record<string, Quiz> = {};
        for (const sub of data) {
          if (!quizMap[sub.quizId]) {
            const q = await DB.getQuizById(sub.quizId);
            if (q) quizMap[sub.quizId] = q;
          }
        }
        setQuizzes(quizMap);

        // Fetch upcoming quizzes (simplified: global fetch from DB might need teacher filter, 
        // but here we show available ones or need a way to find all public quizzes)
        // For SaaS, we usually need a specific teacher workspace. 
        // We'll show upcoming quizzes from the same teacher as the first result found.
        if (data.length > 0) {
          const firstTeacherId = data[0].teacherId;
          const allQuizzes = await DB.getQuizzes(firstTeacherId);
          const now = getAlgeriaNow();
          const upcoming = allQuizzes.filter(q => new Date(q.startTime) > now);
          setUpcomingQuizzes(upcoming);
        }
      }
    } catch (err) {
      setError(lang === 'ar' ? "حدث خطأ أثناء جلب السجلات." : "An error occurred while fetching your records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
           <button onClick={() => window.location.hash = '#/'} className="text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2">
             <i className={`fas fa-arrow-${isRTL ? 'right' : 'left'}`}></i> {t.backHome}
           </button>
           <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{t.studentPortal}</h1>
        </header>

        {!submissions ? (
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-200 text-center max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-300">
             <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 mx-auto mb-8">
               <i className="fas fa-user-graduate text-3xl"></i>
             </div>
             <h2 className="text-3xl font-black text-slate-900 mb-4">{t.academicRecords}</h2>
             <p className="text-slate-500 mb-8">{lang === 'ar' ? 'أدخل بياناتك الشخصية للوصول إلى لوحة نتائجك.' : 'Enter your details to access your result dashboard.'}</p>
             
             {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">{error}</div>}

             <form onSubmit={handleSearch} className="space-y-4 text-right">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-2">{t.firstName}</label>
                   <input 
                    required
                    type="text" 
                    value={fName}
                    onChange={e => setFName(e.target.value)}
                    placeholder={lang === 'ar' ? 'الاسم' : 'First Name'}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-brand-100"
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-2">{t.lastName}</label>
                   <input 
                    required
                    type="text" 
                    value={lName}
                    onChange={e => setLName(e.target.value)}
                    placeholder={lang === 'ar' ? 'اللقب' : 'Last Name'}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-brand-100"
                   />
                 </div>
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-2">{t.phone}</label>
                 <input 
                  required
                  type="tel" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0xxxxxxxxx"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-brand-100"
                 />
               </div>
               <button type="submit" disabled={loading} className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-500 shadow-xl transition-all mt-4">
                 {loading ? t.verifying : t.accessDashboard}
               </button>
             </form>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
             <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="z-10 w-full md:w-auto">
                   <p className="text-brand-400 font-black uppercase text-[10px] tracking-widest mb-1">
                     {lang === 'ar' ? 'ملف الطالب' : 'Student Profile'}
                   </p>
                   <h2 className="text-4xl font-black tracking-tighter">{submissions[0]?.studentName}</h2>
                   <p className="text-slate-400 font-medium">{lang === 'ar' ? 'رقم الهاتف:' : 'Verified Phone:'} {phone}</p>
                </div>
                <div className="flex gap-4 z-10">
                   <div className="text-center bg-slate-800 px-8 py-5 rounded-3xl border border-slate-700 shadow-lg">
                      <div className="text-3xl font-black">{submissions.length}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lang === 'ar' ? 'إجمالي الاختبارات' : 'Total Quizzes'}</div>
                   </div>
                   <div className="text-center bg-brand-900/40 px-8 py-5 rounded-3xl border border-brand-800 shadow-lg">
                      <div className="text-3xl font-black text-brand-400">
                        {Math.round(submissions.reduce((acc, s) => acc + (s.score / s.totalPoints), 0) / submissions.length * 100)}%
                      </div>
                      <div className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">{t.masteryIndex}</div>
                   </div>
                </div>
             </div>

             {/* Upcoming Quizzes */}
             {upcomingQuizzes.length > 0 && (
               <section>
                 <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-2xl font-black text-slate-800">{t.upcomingQuizzes}</h3>
                    <div className="h-px bg-slate-200 flex-1"></div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {upcomingQuizzes.map(q => (
                     <div key={q.id} className="bg-brand-50 border border-brand-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-lg transition-all border-dashed border-2">
                        <div className="flex justify-between items-start mb-4">
                          <span className="w-10 h-10 bg-brand-200 text-brand-700 rounded-xl flex items-center justify-center font-black">
                            <i className="far fa-clock"></i>
                          </span>
                          <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest">
                            {formatToAlgeriaTime(q.startTime, lang)}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-2 truncate">{q.title}</h4>
                        <p className="text-xs text-slate-500 mb-6 line-clamp-2">{q.description}</p>
                        <button 
                          onClick={() => window.location.hash = `#/quiz/${q.id}`}
                          className="w-full py-3 bg-white text-brand-600 rounded-xl font-black text-xs hover:bg-brand-100 transition-all border border-brand-200"
                        >
                          {lang === 'ar' ? 'دخول الاختبار' : 'Enter Assessment'}
                        </button>
                     </div>
                   ))}
                 </div>
               </section>
             )}

             {/* History */}
             <section>
               <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-2xl font-black text-slate-800">{t.allHistory}</h3>
                  <div className="h-px bg-slate-200 flex-1"></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {submissions.map(s => (
                    <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                       <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                             <i className="fas fa-certificate text-xl"></i>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(s.submittedAt).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-GB')}</span>
                       </div>
                       <h3 className="text-xl font-black text-slate-900 mb-2 truncate">
                          {quizzes[s.quizId]?.title || 'Assessment Record'}
                       </h3>
                       <div className="flex items-center gap-3 mb-8">
                          <div className="h-2 flex-1 bg-slate-50 rounded-full overflow-hidden">
                             <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${(s.score/s.totalPoints)*100}%` }}></div>
                          </div>
                          <span className="text-xs font-black text-slate-900">{s.score}/{s.totalPoints}</span>
                       </div>
                       <button 
                          onClick={() => window.location.hash = `#/verify/${s.id}`}
                          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md group-hover:shadow-lg"
                        >
                         <i className="fas fa-crown mr-2 text-yellow-400"></i> {t.certificate}
                       </button>
                    </div>
                  ))}
               </div>
             </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
