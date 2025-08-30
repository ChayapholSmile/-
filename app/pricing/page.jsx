// app/pricing/page.jsx
// หน้านี้จะดึงข้อมูลแพ็กเกจและฟีเจอร์ต่างๆ จากฐานข้อมูล
// ทำให้ Admin สามารถเปิด/ปิดฟีเจอร์ และเปลี่ยนแปลงราคาได้จากระบบหลังบ้าน

import clientPromise from '@/lib/mongodb';
// import { CheckCircleIcon } from '@heroicons/react/24/solid';

// ฟังก์ชันสมมติสำหรับดึงข้อมูลแพ็กเกจจาก DB
async function getPricingPlans() {
  const client = await clientPromise;
  const db = client.db("portfolio_platform");
  // ในการใช้งานจริง ควรมี collection 'plans' หรือ 'products'
  // ที่ Admin สามารถจัดการได้
  return [
    {
      name: 'Free',
      price: '0',
      priceSuffix: 'ตลอดชีพ',
      features: [
        { text: '1 เว็บไซต์พอร์ตฟอลิโอ', enabled: true },
        { text: 'ธีมดีไซน์จำกัด', enabled: true },
        { text: 'จำกัดยอดเข้าชม 1,000 ครั้ง/เดือน', enabled: true },
        { text: 'ระบบจัดการสินค้า (Merch)', enabled: false },
        { text: 'เชื่อมต่อโดเมนส่วนตัว', enabled: false },
        { text: 'ไม่มีโฆษณา', enabled: false },
      ],
      cta: 'เริ่มต้นใช้งานฟรี',
    },
    {
      name: 'Premium',
      price: '100',
      priceSuffix: 'บาท / เดือน',
      features: [
        { text: '3 เว็บไซต์พอร์ตฟอลิโอ', enabled: true },
        { text: 'ทุกธีมดีไซน์และปรับแต่งขั้นสูง', enabled: true },
        { text: 'ไม่จำกัดยอดเข้าชม', enabled: true },
        { text: 'ระบบจัดการสินค้า (Merch)', enabled: true },
        { text: 'เชื่อมต่อโดเมนส่วนตัว', enabled: true },
        { text: 'ไม่มีโฆษณา', enabled: true },
      ],
      cta: 'อัปเกรดเป็น Premium',
      isFeatured: true,
    },
  ];
}


export default async function PricingPage() {
  const plans = await getPricingPlans();

  return (
    <div className="container mx-auto p-4 md:p-8 text-white">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold gradient-text">เลือกแพ็กเกจที่ใช่สำหรับคุณ</h1>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">เริ่มต้นฟรีและอัปเกรดเมื่อคุณพร้อมที่จะเติบโตไปอีกขั้น</p>
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className={`glass-card p-8 rounded-2xl w-full max-w-md ${plan.isFeatured ? 'border-sky-500 border-2' : 'border-gray-700'}`}>
            {plan.isFeatured && <div className="text-center mb-4"><span className="bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full">แนะนำ</span></div>}
            <h2 className="text-3xl font-bold text-center">{plan.name}</h2>
            <p className="text-center text-gray-400 mt-2">{plan.priceSuffix}</p>
            <p className="text-5xl font-extrabold text-center my-6">
              {plan.price}<span className="text-xl font-medium text-gray-300"> {plan.name === 'Premium' && '฿'}</span>
            </p>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className={`flex items-center ${feature.enabled ? 'text-gray-200' : 'text-gray-500 line-through'}`}>
                  {/* Check Icon SVG */}
                  <svg className={`h-6 w-6 mr-3 ${feature.enabled ? 'text-green-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {feature.text}
                </li>
              ))}
            </ul>
            <button className={`w-full font-bold py-3 px-6 rounded-lg transition-transform duration-300 hover:scale-105 ${plan.isFeatured ? 'bg-sky-500 hover:bg-sky-600' : 'bg-gray-600 hover:bg-gray-500'}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
