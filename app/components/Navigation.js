'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto relative">
      <Link href="/" className="flex items-center gap-2">
        <div className="relative w-[40px] h-[40px]">
          <Image
            src="/shapelogo.png"
            alt="Shape Logo"
            fill
            style={{ objectFit: 'contain' }}
            sizes="40px"
          />
        </div>

        <div className="relative w-[180px] h-[45px]">
          <Image
            src="/textlogo1.png"
            alt="Text Logo"
            fill
            style={{ objectFit: 'contain', objectPosition: 'left' }}
            sizes="180px"
            priority
          />
        </div>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        <a href="#" className="text-gray-600 hover:text-[#87CEEB]">
          로그인하면보임1
        </a>
        <a href="#" className="text-gray-600 hover:text-[#87CEEB]">
          로그인하면보임2
        </a>
        <a href="#" className="text-gray-600 hover:text-[#87CEEB]">
          회원가입
        </a>
        <button className="bg-[#87CEEB] text-white px-6 py-2 rounded-full hover:bg-[#7AB8D3] transition">
          바로 주문하기
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden text-gray-600" onClick={toggleMenu} aria-label="Toggle menu">
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 left-0 bg-white shadow-lg rounded-b-lg py-4 px-6 flex flex-col gap-4 md:hidden z-50 mt-1">
          <a href="#" className="text-gray-600 hover:text-[#87CEEB] py-2">
            로그인하면보임1
          </a>
          <a href="#" className="text-gray-600 hover:text-[#87CEEB] py-2">
            로그인하면보임2
          </a>
          <a href="#" className="text-gray-600 hover:text-[#87CEEB] py-2">
            회원가입
          </a>
          <button className="bg-[#87CEEB] text-white px-6 py-2 rounded-full hover:bg-[#7AB8D3] transition w-full">
            바로 주문하기
          </button>
        </div>
      )}
    </nav>
  );
}
