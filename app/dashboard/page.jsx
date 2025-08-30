// app/dashboard/page.jsx
// ใช้ Shadcn/UI และ Tremor (สำหรับกราฟ) เพื่อสร้าง UI ที่สวยงาม
// หน้านี้จะต้องเป็น Protected Route (เข้าถึงได้เฉพาะผู้ใช้ที่ล็อกอิน)

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

// --- สมมติว่านี่คือ UI Components จาก Shadcn/UI ---
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { ChartComponent } from "@/components/ChartComponent"; // Component กราฟที่เราสร้างเอง

async function getDashboardData(userId) {
  const client = await clientPromise;
  const db = client.db("portfolio_platform");
  
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  const portfolio = await db.collection("portfolios").findOne({ userId: new ObjectId(userId) });
  const pendingPayment = await db.collection("payments").findOne({ 
    userId: new ObjectId(userId),
    status: "pending"
  });

  return {
    views: portfolio?.views || 0,
    viewHistory: portfolio?.viewHistory || [],
    plan: user?.plan || 'free',
    subscriptionEnds: user?.subscriptionEnds,
    hasPendingPayment: !!pendingPayment, // ส่งสถานะการรออนุมัติไปด้วย
  };
}

// Component สำหรับแสดงสถานะแพ็กเกจที่ซับซ้อนขึ้น
function PlanStatusCard({ plan, subscriptionEnds, hasPendingPayment }) {
    let statusText = 'Free';
    let statusColor = 'text-yellow-400';
    let subText = 'อัปเกรดเพื่อปลดล็อกฟีเจอร์ทั้งหมด';

    if (hasPendingPayment) {
        statusText = 'รอการอนุมัติ';
        statusColor = 'text-blue-400';
        subText = 'เรากำลังตรวจสอบการชำระเงินของคุณ';
    } else if (plan === 'premium' && subscriptionEnds) {
        statusText = 'Premium';
        statusColor = 'text-green-400';
        subText = `จะหมดอายุในวันที่: ${new Date(subscriptionEnds).toLocaleDateString('th-TH')}`;
    }

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400">แพ็กเกจปัจจุบัน</h3>
            <p className={`text-3xl font-bold mt-2 capitalize ${statusColor}`}>{statusText}</p>
            <p className="text-xs text-gray-500 mt-1">{subText}</p>
        </div>
    );
}


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin"); // ถ้ายังไม่ล็อกอิน ให้ไปหน้า sign in
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 gradient-text">Dashboard ของคุณ</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card แสดงยอดวิว */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400">ยอดเข้าชมทั้งหมด</h3>
          <p className="text-3xl font-bold mt-2">{data.views.toLocaleString()}</p>
        </div>

        {/* Card แสดงสถานะแพ็กเกจ (แบบใหม่) */}
        <PlanStatusCard 
            plan={data.plan} 
            subscriptionEnds={data.subscriptionEnds} 
            hasPendingPayment={data.hasPendingPayment} 
        />
        
        {/* Card สำหรับจัดการ Portfolio */}
        <div className="bg-sky-500/20 p-6 rounded-lg border border-sky-400/50 flex flex-col justify-center items-center">
          <h3 className="text-lg font-bold text-white">จัดการพอร์ตฟอลิโอ</h3>
          <p className="text-sm text-sky-200 mb-4">แก้ไขข้อมูลและดีไซน์เว็บของคุณ</p>
          <button className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors">
            เริ่มแก้ไข
          </button>
        </div>
      </div>

      {/* กราฟแสดงผล */}
      <div className="mt-8 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4">สถิติยอดเข้าชม (7 วันล่าสุด)</h3>
        {/* <ChartComponent data={data.viewHistory} /> */}
        <div className="h-64 flex items-center justify-center text-gray-500">
          [ส่วนของกราฟจะแสดงผลที่นี่]
        </div>
      </div>

      {/* ส่วนจัดการสินค้า Merch */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">จัดการสินค้า (Merch)</h2>
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 text-center">
            <p className="text-gray-400">คุณสามารถเพิ่มสินค้าหรือบริการของคุณได้ที่นี่</p>
            {data.plan === 'free' ? (
                <p className="text-yellow-400 mt-2">ฟีเจอร์นี้สำหรับ Premium เท่านั้น! <a href="/pricing" className="underline hover:text-yellow-300">อัปเกรดเลย</a></p>
            ) : (
                <button className="mt-4 bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors">
                    เพิ่มสินค้าใหม่
                </button>
            )}
        </div>
      </div>
    </div>
  );
}

