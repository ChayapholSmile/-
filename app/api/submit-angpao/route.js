// app/api/submit-angpao/route.js
// API Endpoint ใหม่สำหรับให้ผู้ใช้ส่งลิงก์ซองอั่งเปา
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from 'mongodb';

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { angpaoLink } = await request.json();

    if (!angpaoLink || !angpaoLink.startsWith('https://gift.truemoney.com/')) {
      return NextResponse.json({ error: 'Invalid TrueMoney Angpao link' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("portfolio_platform");

    // ตรวจสอบว่ามี pending payment อยู่แล้วหรือไม่
    const existingPayment = await db.collection("payments").findOne({
      userId: new ObjectId(session.user.id),
      status: "pending",
    });

    if (existingPayment) {
      return NextResponse.json({ error: 'You already have a pending payment.' }, { status: 409 });
    }

    const result = await db.collection("payments").insertOne({
      userId: new ObjectId(session.user.id),
      userEmail: session.user.email,
      angpaoLink: angpaoLink,
      status: "pending", // pending, completed, rejected
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, paymentId: result.insertedId });

  } catch (error) {
    console.error("Failed to submit Angpao link:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
