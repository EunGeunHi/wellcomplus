'use client';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroButton() {
  return (
    <div className="mt-2 flex flex-row gap-2 sm:gap-4">
      <Link href="/userpage/application">
        <button
          className="group bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 sm:px-8 sm:py-4 rounded-lg text-white 
                  font-['ShillaCulture'] font-medium text-sm sm:text-lg hover:shadow-lg hover:shadow-sky-200 transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-2">
            바로 주문하기
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </Link>

      <button
        className="px-4 py-3 sm:px-8 sm:py-4 rounded-lg text-slate-700 border border-slate-300
                font-['ShillaCulture'] font-medium text-sm sm:text-lg hover:border-sky-500 hover:text-sky-600 transition-all duration-300"
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
