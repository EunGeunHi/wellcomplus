import { ArrowUpRight, Zap, Computer, BookOpenCheck, ShieldCheck, MapPin } from 'lucide-react';
import HeroSlider from './components/HeroSlider';
import HeroButton from './components/HeroButton';
import Link from 'next/link';
import TestAlert from './components/TestAlert';
import ReviewCarousel from './components/ReviewCarousel';
import AssemblyShowcaseOptimized from './components/AssemblyShowcaseOptimized';

export default function Home() {
  // 구조화된 데이터 (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: '웰컴시스템 컴퓨터 전문점',
    alternateName: 'WellComSystem',
    description: '35년 전통의 컴퓨터, 노트북, 프린터 전문점. 맞춤형 견적 및 평생 A/S 서비스 제공',
    url: 'https://www.okwellcom.com',
    telephone: '010-8781-8871',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '온천장로 20 부산컴퓨터도매상가 2층 209호',
      addressLocality: '동래구',
      addressRegion: '부산시',
      postalCode: '47764',
      addressCountry: 'KR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 35.21399045790162,
      longitude: 129.0796384915669,
    },
    openingHours: 'Mo-Sa 09:00-18:00',
    founder: '김선식',
    foundingDate: '1989',
    areaServed: '부산광역시',
    serviceType: [
      '컴퓨터 판매',
      '노트북 판매',
      '프린터 판매',
      '컴퓨터 수리',
      'A/S 서비스',
      '맞춤형 견적',
    ],
    priceRange: '$$',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '컴퓨터 및 IT 서비스',
      itemListElement: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'KRW',
          availability: 'https://schema.org/InStock',
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: '0',
            priceCurrency: 'KRW',
            valueAddedTaxIncluded: false,
            description: '견적 상담 후 가격 결정',
          },
          itemOffered: {
            '@type': 'Product',
            name: '맞춤형 컴퓨터 조립',
            description: '고객 맞춤형 컴퓨터 조립 서비스 (견적 상담 후 가격 결정)',
            image: [
              'https://www.okwellcom.com/assembly/photos/3-화이트RGB게이밍.webp',
              'https://www.okwellcom.com/assembly/photos/5-게이밍RGB.webp',
              'https://www.okwellcom.com/assembly/photos/17-화이트게이밍rgb.webp',
            ],
            brand: {
              '@type': 'Brand',
              name: '웰컴시스템',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '250',
              bestRating: '5',
              worstRating: '1',
            },
            review: [
              {
                '@type': 'Review',
                author: {
                  '@type': 'Person',
                  name: '김○○',
                },
                datePublished: '2024-01-15',
                reviewBody:
                  '35년 노하우가 느껴지는 완벽한 조립 서비스였습니다. 게이밍 성능도 만족스럽고 AS도 신속해요.',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: '5',
                  bestRating: '5',
                },
              },
              {
                '@type': 'Review',
                author: {
                  '@type': 'Person',
                  name: '박○○',
                },
                datePublished: '2024-02-03',
                reviewBody:
                  '맞춤형 견적으로 예산에 맞는 최적의 컴퓨터를 만들어주셨어요. 강력 추천합니다.',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: '5',
                  bestRating: '5',
                },
              },
            ],
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'KRW',
              availability: 'https://schema.org/InStock',
              priceSpecification: {
                '@type': 'PriceSpecification',
                price: '0',
                priceCurrency: 'KRW',
                valueAddedTaxIncluded: false,
                description: '견적 상담 후 가격 결정',
              },
              priceValidUntil: '2024-12-31',
              seller: {
                '@type': 'Organization',
                name: '웰컴시스템',
              },
              hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'KR',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 7,
                returnMethod: [
                  'https://schema.org/ReturnByMail',
                  'https://schema.org/ReturnInStore',
                ],
                returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
                additionalProperty: {
                  '@type': 'PropertyValue',
                  name: '반품비용 안내',
                  value: '기본 무료, 상황에 따라 비용 발생 가능',
                },
              },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                  '@type': 'MonetaryAmount',
                  minValue: '10000',
                  maxValue: '30000',
                  currency: 'KRW',
                },
                shippingDestination: {
                  '@type': 'DefinedRegion',
                  addressCountry: 'KR',
                },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime',
                  handlingTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 1,
                    maxValue: 2,
                    unitCode: 'DAY',
                  },
                  transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 1,
                    maxValue: 7,
                    unitCode: 'DAY',
                  },
                },
              },
            },
          },
        },
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'KRW',
          availability: 'https://schema.org/InStock',
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: '0',
            priceCurrency: 'KRW',
            valueAddedTaxIncluded: false,
            description: '견적 상담 후 가격 결정',
          },
          itemOffered: {
            '@type': 'Product',
            name: '노트북 판매 및 상담',
            description: '다양한 브랜드 노트북 판매 및 전문 상담 (견적 상담 후 가격 결정)',
            image: ['https://www.okwellcom.com/products/notebook-generic.svg'],
            brand: {
              '@type': 'Brand',
              name: '웰컴시스템',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.7',
              reviewCount: '180',
              bestRating: '5',
              worstRating: '1',
            },
            review: [
              {
                '@type': 'Review',
                author: {
                  '@type': 'Person',
                  name: '이○○',
                },
                datePublished: '2024-01-20',
                reviewBody:
                  '다양한 노트북 브랜드 비교 상담받고 최적의 제품을 구매했어요. 전문적인 상담이 인상적이었습니다.',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: '5',
                  bestRating: '5',
                },
              },
              {
                '@type': 'Review',
                author: {
                  '@type': 'Person',
                  name: '최○○',
                },
                datePublished: '2024-02-10',
                reviewBody: '업무용 노트북 추천받았는데 성능과 가격 모두 만족스러워요.',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: '4',
                  bestRating: '5',
                },
              },
            ],
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'KRW',
              availability: 'https://schema.org/InStock',
              priceSpecification: {
                '@type': 'PriceSpecification',
                price: '0',
                priceCurrency: 'KRW',
                valueAddedTaxIncluded: false,
                description: '견적 상담 후 가격 결정',
              },
              priceValidUntil: '2024-12-31',
              seller: {
                '@type': 'Organization',
                name: '웰컴시스템',
              },
              hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'KR',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 7,
                returnMethod: [
                  'https://schema.org/ReturnByMail',
                  'https://schema.org/ReturnInStore',
                ],
                returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
                additionalProperty: {
                  '@type': 'PropertyValue',
                  name: '반품비용 안내',
                  value: '기본 무료, 상황에 따라 비용 발생 가능',
                },
              },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                  '@type': 'MonetaryAmount',
                  minValue: '10000',
                  maxValue: '30000',
                  currency: 'KRW',
                },
                shippingDestination: {
                  '@type': 'DefinedRegion',
                  addressCountry: 'KR',
                },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime',
                  handlingTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 1,
                    maxValue: 2,
                    unitCode: 'DAY',
                  },
                  transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 1,
                    maxValue: 7,
                    unitCode: 'DAY',
                  },
                },
              },
            },
          },
        },
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'KRW',
          availability: 'https://schema.org/InStock',
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: '0',
            priceCurrency: 'KRW',
            valueAddedTaxIncluded: false,
            description: '견적 상담 후 가격 결정',
          },
          itemOffered: {
            '@type': 'Product',
            name: '프린터 판매 및 설치',
            description: '프린터 판매 및 설치 서비스 (견적 상담 후 가격 결정)',
            image: ['https://www.okwellcom.com/products/printer-generic.svg'],
            brand: {
              '@type': 'Brand',
              name: '웰컴시스템',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '120',
              bestRating: '5',
              worstRating: '1',
            },
            review: [
              {
                '@type': 'Review',
                author: {
                  '@type': 'Person',
                  name: '정○○',
                },
                datePublished: '2024-01-25',
                reviewBody:
                  '프린터 설치부터 설정까지 완벽하게 처리해주셨어요. 사무실에서 바로 사용 가능했습니다.',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: '5',
                  bestRating: '5',
                },
              },
              {
                '@type': 'Review',
                author: {
                  '@type': 'Person',
                  name: '한○○',
                },
                datePublished: '2024-02-15',
                reviewBody:
                  '복합기 추천과 설치 서비스 모두 만족스러웠습니다. 전문적인 상담 감사합니다.',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: '5',
                  bestRating: '5',
                },
              },
            ],
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'KRW',
              availability: 'https://schema.org/InStock',
              priceSpecification: {
                '@type': 'PriceSpecification',
                price: '0',
                priceCurrency: 'KRW',
                valueAddedTaxIncluded: false,
                description: '견적 상담 후 가격 결정',
              },
              priceValidUntil: '2024-12-31',
              seller: {
                '@type': 'Organization',
                name: '웰컴시스템',
              },
              hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'KR',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 7,
                returnMethod: [
                  'https://schema.org/ReturnByMail',
                  'https://schema.org/ReturnInStore',
                ],
                returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
                additionalProperty: {
                  '@type': 'PropertyValue',
                  name: '반품비용 안내',
                  value: '기본 무료, 상황에 따라 비용 발생 가능',
                },
              },
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: {
                  '@type': 'MonetaryAmount',
                  minValue: '10000',
                  maxValue: '30000',
                  currency: 'KRW',
                },
                shippingDestination: {
                  '@type': 'DefinedRegion',
                  addressCountry: 'KR',
                },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime',
                  handlingTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 1,
                    maxValue: 2,
                    unitCode: 'DAY',
                  },
                  transitTime: {
                    '@type': 'QuantitativeValue',
                    minValue: 1,
                    maxValue: 7,
                    unitCode: 'DAY',
                  },
                },
              },
            },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '컴퓨터 A/S 서비스',
            description: '전문적인 컴퓨터 A/S 및 수리 서비스',
            provider: {
              '@type': 'Organization',
              name: '웰컴시스템',
            },
          },
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1000',
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: ['https://www.okwellcom.com'],
  };

  return (
    <>
      {/* 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <TestAlert />
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-blue-50 to-sky-50 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-16 items-center">
            {/* Content column */}
            <div className="order-1 lg:order-1">
              <span className="inline-block px-3 py-1 text-sky-700 bg-sky-100 rounded-full text-xs sm:text-sm font-medium font-['ShillaCulture'] mb-3 sm:mb-6">
                35년 전통의 기술력
              </span>

              <h1 className="text-slate-800 mb-4 sm:mb-6">
                <span className="block text-3xl sm:text-5xl md:text-7xl font-['BMJUA'] font-medium leading-tight mb-2 sm:mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                    웰컴
                  </span>
                  시스템에서
                  <br />
                  <span className="relative">맞춤형</span>
                  <span> 솔루션</span>을 경험하세요
                </span>
                <span className="block text-base sm:text-xl md:text-2xl text-slate-600 font-['ShillaCulture'] font-normal mt-3 sm:mt-6">
                  35년간 쌓아온 기술 노하우로 고객님의 IT 환경을 한 단계 업그레이드해 드립니다
                </span>
              </h1>
              <HeroButton />
            </div>
            {/* Image column */}
            <HeroSlider />
          </div>
        </div>
      </div>

      {/* 조립 컴퓨터 갤러리 */}
      <AssemblyShowcaseOptimized />

      {/* 리뷰 컴포넌트 부분  */}
      <ReviewCarousel />

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 font-['NanumGothic']">
          <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#3661EB] to-[#87CEEB]">
              웰컴시스템과 함께하는 스마트한 선택
            </h2>
            <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto">
              35년 전통의 기술력으로 고객님의 완벽한 컴퓨팅 환경을 구축해 드립니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-6">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-[#3661EB]" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3">당일 컴퓨터 출고</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 flex-grow">
                오후 1시 이전 주문 시 당일 발송! 업계 최고 속도로 고객님의 새 컴퓨터를 만나보세요.
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#3661EB]">
                평균 배송시간 24시간 이내
              </p>
            </div>

            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-6">
                <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[#3661EB]" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 tracking-tighter">
                컴퓨터 폐기까지 AS지원
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 flex-grow">
                한번 고객은 영원한 고객! 구매 후에도 안심하세요. 전문 기술진의 신속한 서비스를 평생
                보장합니다.
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#3661EB]">
                전화 한 통으로 즉시 지원
              </p>
            </div>

            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-6">
                <Computer className="w-6 h-6 sm:w-8 sm:h-8 text-[#3661EB]" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3">맞춤형 설계</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 flex-grow">
                게임, 그래픽 작업, 사무용 등 용도에 맞는 최적의 컴퓨터를 제안해 드립니다.
                온/오프라인 상담 가능!
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#3661EB]">
                5,000+ 고객 맞춤 설계 경험
              </p>
            </div>

            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-6">
                <BookOpenCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[#3661EB]" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3">35년 노하우</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 flex-grow">
                업계 최고 경력의 기술진이 최신 트렌드와 기술력으로 최상의 가성비 컴퓨터를
                제공합니다.
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#3661EB]">1만+ 고객 만족 구축</p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 text-center">
            <Link
              href="/userpage/application"
              className="inline-flex items-center gap-2 bg-[#3661EB] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold hover:bg-[#2b4fc7] transition-colors duration-300 text-sm sm:text-base"
            >
              무료 견적 상담받기
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 font-['NanumGothic']">
          <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#3661EB] to-[#87CEEB]">
              찾아오시는 길
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-[#3661EB] to-[#87CEEB] mx-auto mb-2 rounded-full"></div>
            <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto">
              언제든지 방문하셔서 직접 상담받아보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
            {/* Map Side */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-lg border border-blue-100 overflow-hidden flex flex-col h-full">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 px-2 text-[#3661EB]">
                위치 안내
              </h3>
              <div className="flex-grow h-[250px] sm:h-[320px] rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=부산컴퓨터도매상가&center=35.21399045790162,129.0796384915669&zoom=16`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
                <p className="text-gray-700 flex items-center text-sm sm:text-base">
                  <span className="inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3661EB] text-white flex items-center justify-center mr-2">
                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </span>
                  부산시 동래구 온천장로 20 (부산컴퓨터도매상가 2층 209호)
                </p>
              </div>
            </div>

            {/* Info Side */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-lg border border-blue-100 flex flex-col h-full">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 px-2 text-[#3661EB]">
                회사 정보
              </h3>

              <div className="space-y-3 sm:space-y-4 flex-grow">
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="p-2 sm:p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-2 sm:mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5 text-[#3661EB]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 text-xs sm:text-sm">대표자</p>
                        <p className="text-gray-600 text-xs sm:text-sm">김선식</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 sm:p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-2 sm:mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5 text-[#3661EB]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 text-xs sm:text-sm">상호</p>
                        <p className="text-gray-600 text-xs sm:text-sm">웰컴시스템</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2 sm:p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-2 sm:mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5 text-[#3661EB]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-700 text-xs sm:text-sm">사업자번호</p>
                      <p className="text-gray-600 text-xs sm:text-sm">607-02-70320</p>
                    </div>
                  </div>
                </div>

                <div className="p-2 sm:p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-2 sm:mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5 text-[#3661EB]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-700 text-xs sm:text-sm">전화번호</p>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        010-8781-8871, 051-926-6604
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2 sm:p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-2 sm:mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5 text-[#3661EB]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-700 text-xs sm:text-sm">운영시간</p>
                      <div className="mt-1">
                        <div className="flex items-center mb-1">
                          <span className="font-medium w-12 sm:w-20 text-gray-700 text-xs sm:text-sm">
                            월~금
                          </span>
                          <span className="text-gray-600 text-xs sm:text-sm">11시 ~ 20시</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium w-12 sm:w-20 text-gray-700 text-xs sm:text-sm">
                            토요일
                          </span>
                          <span className="text-gray-600 text-xs sm:text-sm">11시 ~ 18시</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-12 sm:w-20 text-gray-700 text-xs sm:text-sm">
                            일요일
                          </span>
                          <span className="text-gray-600 text-xs sm:text-sm">휴무</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <a
                  href="tel:01087818871"
                  className="inline-flex items-center gap-2 bg-[#3661EB] text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-bold hover:bg-[#2b4fc7] transition-colors duration-300 w-full justify-center text-sm sm:text-base"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  전화 상담하기
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 폰트 크레딧 섹션 */}
      <section className="py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2 font-['NanumGothic']">
              폰트 출처
            </h3>
            <div className="text-xs sm:text-sm text-gray-600 font-['NanumGothic']">
              {/* 모바일: 세로 배열, 데스크톱: 가로 배열 */}
              <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center space-y-1 sm:space-y-0">
                <span className="block sm:inline">
                  <span className="font-semibold">실라문화체</span> - 경주시 제공
                </span>
                <span className="hidden sm:inline text-gray-500 mx-2">|</span>
                <span className="block sm:inline">
                  <span className="font-semibold">배민 주아체</span> - ㈜우아한형제들 제공
                </span>
                <span className="hidden sm:inline text-gray-500 mx-2">|</span>
                <span className="block sm:inline">
                  <span className="font-semibold">나눔고딕</span> - 네이버 및 네이버문화재단 제공
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
