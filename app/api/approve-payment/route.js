// app/api/approve-payment/route.js
// API Endpoint ใหม่สำหรับ Admin เพื่อยืนยันการชำระเงิน
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from 'mongodb';

// ฟังก์ชันนี้ควรตรวจสอบว่า session ของผู้ใช้เป็น Admin จริงหรือไม่
async function isAdmin(session) {
  // ตัวอย่าง: ตรวจสอบจาก email หรือ role ใน DB
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || !(await isAdmin(session))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { paymentId, userId } = await request.json();

    if (!paymentId || !userId) {
      return NextResponse.json({ error: 'Missing paymentId or userId' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("portfolio_platform");

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // ให้สิทธิ์ 1 เดือน

    // 1. อัปเดต User ให้เป็น Premium
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          plan: 'premium', 
          subscriptionEnds: subscriptionEndDate,
        } 
      }
    );

    // 2. อัปเดตสถานะ Payment เป็น completed
    await db.collection("payments").updateOne(
      { _id: new ObjectId(paymentId) },
      {
        $set: {
          status: "completed",
          approvedAt: new Date(),
          approvedBy: session.user.email,
        }
      }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Failed to approve payment:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
