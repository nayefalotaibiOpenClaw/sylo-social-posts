import React from 'react';
import EditableText from './EditableText';
import { Smartphone, CheckCircle, Globe, ShoppingCart } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function OnlineStorePost() {
  const t = useTheme();
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto text-white font-sans" style={{ backgroundColor: t.primary }}>

            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ backgroundColor: t.accent + '4d' }}></div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">

                {/* Header */}
                <div className="text-center mt-6">
                    <h2 className="text-4xl sm:text-5xl font-black mb-2 leading-tight" style={{ color: t.accentLight }}>
                        موقعك
                        <br/>
                        <span className="text-white">باسمك</span>
                    </h2>
                    <EditableText as="p" className="text-gray-400 text-lg sm:text-xl font-bold">بدون عمولات منصات التوصيل</EditableText>
                </div>

                {/* Central Visual - Phone Mockup */}
                <div className="w-full max-w-xs relative flex justify-center">

                    {/* Floating Bubble - Commission */}
                    <div className="absolute -top-4 -right-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-black shadow-lg z-20 transform rotate-6 border-2 border-white/20">
                        0% عمولة
                    </div>

                    {/* Phone Frame */}
                    <div className="w-48 h-80 bg-black rounded-[2rem] border-[6px] border-gray-800 shadow-2xl relative overflow-hidden z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                         {/* Dynamic Island */}
                         <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-20"></div>

                         {/* Screen Content */}
                         <div className="w-full h-full pt-8 px-3 flex flex-col items-center" style={{ backgroundColor: t.primaryLight }}>
                             {/* Fake Navbar */}
                             <div className="w-full flex justify-between items-center mb-4">
                                 <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                 <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                                 <ShoppingCart size={16} style={{ color: t.primary }} />
                             </div>

                             {/* Hero Image */}
                             <div className="w-full h-24 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: t.accentLight + '33' }}>
                                 <div className="w-10 h-10 rounded-full opacity-50" style={{ backgroundColor: t.accentLight }}></div>
                             </div>

                             {/* Menu Items */}
                             <div className="w-full space-y-2">
                                 {[1, 2, 3].map((i) => (
                                     <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm">
                                         <div className="w-10 h-10 bg-gray-100 rounded-md shrink-0"></div>
                                         <div className="flex-1 flex flex-col gap-1">
                                             <div className="w-16 h-2 bg-gray-200 rounded-full"></div>
                                             <div className="w-8 h-2 bg-gray-100 rounded-full"></div>
                                         </div>
                                         <div className="w-4 h-4 text-white rounded flex items-center justify-center text-[8px] font-bold" style={{ backgroundColor: t.primary }}>+</div>
                                     </div>
                                 ))}
                             </div>

                             {/* Checkout Button */}
                             <div className="mt-auto mb-4 w-full text-white text-[10px] font-bold py-2 rounded-lg text-center" style={{ backgroundColor: t.primary }}>
                                 إتمام الطلب
                             </div>
                         </div>
                    </div>

                    {/* Background Circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border rounded-full animate-spin-slow-reverse" style={{ borderColor: t.accent + '33' }}></div>
                </div>

                {/* Features Footer */}
                <div className="flex gap-4 sm:gap-6 mt-4 opacity-90 text-sm font-bold">
                    <div className="flex items-center gap-1.5" style={{ color: t.accentLight }}>
                        <Globe size={16} />
                        <EditableText>دومين خاص</EditableText>
                    </div>
                    <div className="flex items-center gap-1.5" style={{ color: t.accentLight }}>
                        <Smartphone size={16} />
                        <EditableText>متجاوب</EditableText>
                    </div>
                    <div className="flex items-center gap-1.5" style={{ color: t.accentLight }}>
                        <CheckCircle size={16} />
                        <EditableText>دفع آمن</EditableText>
                    </div>
                </div>

            </div>
      </div>
  );
}
