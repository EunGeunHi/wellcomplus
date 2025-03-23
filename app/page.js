import { ArrowUpRight, Zap, Shield, TrendingUp } from 'lucide-react';
import HeroSlider from './components/HeroSlider';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-gradient pt-20">
        <HeroSlider />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">왜 웰컴시스템을 선택해야 하나요?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <Zap className="w-12 h-12 text-[#87CEEB] mb-4" />
              <h3 className="text-xl font-semibold mb-3">당일 컴퓨터 출고</h3>
              <p className="text-gray-600">오후 1시까지 주문 넣으면 당일출고</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <Shield className="w-12 h-12 text-[#87CEEB] mb-4" />
              <h3 className="text-xl font-semibold mb-3">평생 AS</h3>
              <p className="text-gray-600">
                한번고객은 영원한 고객! 언제든지 AS문의 주시면 친절히 안내해드립니다.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <TrendingUp className="w-12 h-12 text-[#87CEEB] mb-4" />
              <h3 className="text-xl font-semibold mb-3">쉽고 간단하다</h3>
              <p className="text-gray-600">온/오프라인 원하시는 방법으로 하실수 있습니다.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <Zap className="w-12 h-12 text-[#87CEEB] mb-4" />
              <h3 className="text-xl font-semibold mb-3">높은 전문성</h3>
              <p className="text-gray-600">
                35년동안 쌓아온 기술과 노하우로 최고의 컴퓨터를 맞춰드립니다!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already transforming their financial future with
            웰컴플러스.
          </p>
          <button className="bg-gradient-to-r from-[#87CEEB] to-[#5F9DF7] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 flex items-center gap-2 mx-auto">
            Create Free Account
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </>
  );
}
