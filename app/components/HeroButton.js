'use client';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroButton() {
  return (
    <div className="mt-10 flex flex-col sm:flex-row gap-4">
      <Link href="/userpage/application">
        <button
          className="group bg-gradient-to-r from-blue-600 to-sky-500 px-8 py-4 rounded-lg text-white 
                  font-['ShillaCulture'] font-medium text-lg hover:shadow-lg hover:shadow-sky-200 transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-2">
            바로 주문하기
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </Link>

      <button
        className="px-8 py-4 rounded-lg text-slate-700 border border-slate-300
                font-['ShillaCulture'] font-medium text-lg hover:border-sky-500 hover:text-sky-600 transition-all duration-300"
        onClick={() => {
          const featuresSection = document.getElementById('features');
          if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <span className="flex items-center justify-center gap-2">더 알아보기</span>
      </button>
    </div>
  );
}
