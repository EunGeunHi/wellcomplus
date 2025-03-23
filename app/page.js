import { ArrowUpRight, Zap, Shield, TrendingUp } from 'lucide-react';
import HeroSlider from './components/HeroSlider';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="hero-gradient py-20">
          <HeroSlider />
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose 웰컴플러스</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl">
                <Zap className="w-12 h-12 text-[#87CEEB] mb-4" />
                <h3 className="text-xl font-semibold mb-3">Fast Transactions</h3>
                <p className="text-gray-600">
                  Execute trades and transfers instantly with our cutting-edge platform.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl">
                <Shield className="w-12 h-12 text-[#87CEEB] mb-4" />
                <h3 className="text-xl font-semibold mb-3">Bank-Grade Security</h3>
                <p className="text-gray-600">
                  Your assets are protected with state-of-the-art security measures.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl">
                <TrendingUp className="w-12 h-12 text-[#87CEEB] mb-4" />
                <h3 className="text-xl font-semibold mb-3">Smart Analytics</h3>
                <p className="text-gray-600">
                  Make informed decisions with our advanced analytics tools.
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
            <button className="bg-[#87CEEB] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#7AB8D3] transition flex items-center gap-2 mx-auto">
              Create Free Account
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
