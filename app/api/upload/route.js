// app/api/upload/route.js
// API สำหรับรับไฟล์ในรูปแบบ Base64 และบันทึกลง MongoDB โดยตรง
// เราจะเช็ค session เพื่อให้แน่ใจว่าเฉพาะผู้ใช้ที่ล็อกอินเท่านั้นที่อัปโหลดได้

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import clientPromise from "../../../lib/mongodb"; // ปรับ path ให้ถูกต้อง
import { ObjectId } from 'mongodb';

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { filename, fileData } = await request.json(); // รับ filename และ base64 data

    if (!filename || !fileData) {
      return new Response(JSON.stringify({ error: 'Missing filename or file data' }), { status: 400 });
    }
    
    // **ข้อควรระวัง:** MongoDB มีขนาด Document Limit ที่ 16MB
    // การเก็บไฟล์ขนาดใหญ่เป็น Base64 อาจไม่เหมาะสม
    // วิธีนี้เหมาะสำหรับไฟล์รูปภาพโปรไฟล์ หรือไอคอนขนาดเล็ก

    const client = await clientPromise;
    const db = client.db("portfolio_platform");

    const result = await db.collection("user_files").insertOne({
      userId: new ObjectId(session.user.id),
      filename: filename,
      data: fileData, // บันทึก Base64 string
      uploadedAt: new Date(),
    });

    // ส่ง ID ของไฟล์ที่เพิ่งบันทึกกลับไป
    return NextResponse.json({ success: true, fileId: result.insertedId });

  } catch (error) {
    console.error("Failed to save base64 file:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

/* --- ตัวอย่างโค้ดฝั่ง Client (React) สำหรับแปลงไฟล์เป็น Base64 และเรียกใช้ API นี้ ---

  const handleFileChangeAndUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            fileData: base64Data,
          }),
        });

        const result = await response.json();

        if (result.success) {
          console.log('File uploaded successfully! File ID:', result.fileId);
          // คุณสามารถนำ fileId นี้ไปอัปเดตใน state หรือบันทึกใน document อื่นได้
        } else {
          console.error('Upload failed:', result.error);
        }
      } catch (error) {
        console.error('An error occurred during upload:', error);
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsDataURL(file); // เริ่มทำการอ่านไฟล์และแปลงเป็น Base64
  };
*/

