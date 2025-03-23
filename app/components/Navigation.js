'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2 bg-white/95 backdrop-blur-sm shadow-md' : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-[45px] h-[45px] transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/shapelogo.png"
              alt="Shape Logo"
              fill
              style={{ objectFit: 'contain' }}
              sizes="45px"
              className="drop-shadow-sm"
              priority
            />
          </div>

          <div className="relative w-[180px] h-[45px] transition-all duration-300 group-hover:translate-x-1">
            <Image
              src="/textlogo1.png"
              alt="Text Logo"
              fill
              style={{ objectFit: 'contain', objectPosition: 'left' }}
              sizes="180px"
              className="drop-shadow-sm"
              priority
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#"
            className="relative text-gray-700 hover:text-[#87CEEB] transition-colors duration-300 font-medium overflow-hidden group"
          >
            <span className="relative z-10">로그인하면보임1</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#87CEEB] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#"
            className="relative text-gray-700 hover:text-[#87CEEB] transition-colors duration-300 font-medium overflow-hidden group"
          >
            <span className="relative z-10">로그인하면보임2</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#87CEEB] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#"
            className="relative text-gray-700 hover:text-[#87CEEB] transition-colors duration-300 font-medium overflow-hidden group"
          >
            <span className="relative z-10">회원가입</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#87CEEB] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <button className="bg-gradient-to-r from-[#87CEEB] to-[#5F9DF7] text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 font-medium">
            바로 주문하기
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu Dropdown */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleMenu}
        >
          <div
            className={`absolute top-0 right-0 h-screen w-64 bg-white shadow-xl transition-transform duration-300 p-6 flex flex-col gap-6 ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={toggleMenu}
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <a
                href="#"
                className="text-gray-700 hover:text-[#87CEEB] transition-colors duration-200 py-2 border-b border-gray-100"
              >
                로그인하면보임1
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-[#87CEEB] transition-colors duration-200 py-2 border-b border-gray-100"
              >
                로그인하면보임2
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-[#87CEEB] transition-colors duration-200 py-2 border-b border-gray-100"
              >
                회원가입
              </a>
              <button className="bg-gradient-to-r from-[#87CEEB] to-[#5F9DF7] text-white px-6 py-3 rounded-full hover:shadow-md transition mt-4 font-medium">
                바로 주문하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
