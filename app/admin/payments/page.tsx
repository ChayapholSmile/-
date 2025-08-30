// app/admin/payments/page.jsx
// หน้าใหม่สำหรับ Admin เท่านั้น!
'use client'; // หน้านี้ต้องเป็น Client Component เพราะมีการโต้ตอบกับผู้ใช้

import { useState, useEffect } from 'react';

// Component สำหรับแสดงแต่ละรายการ
function PaymentRow({ payment, onApprove }) {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    if (!confirm(`คุณยืนยันว่าได้รับเงินจาก ${payment.userEmail} แล้วใช่หรือไม่?`)) {
        return;
    }
    setIsApproving(true);
    await onApprove(payment._id, payment.userId);
    setIsApproving(false);
  };

  return (
    <div className="grid grid-cols-3 gap-4 items-center p-4 border-b border-gray-700">
      <div className="text-gray-300">{payment.userEmail}</div>
      <div>
        <a href={payment.angpaoLink} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
          เปิดลิงก์ซองอั่งเปา
        </a>
      </div>
      <div>
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-500 transition-colors"
        >
          {isApproving ? 'กำลังอนุมัติ...' : 'อนุมัติ'}
        </button>
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    // ในการใช้งานจริง ควรมีการ fetch ข้อมูลจาก API ที่มีการป้องกัน
    // สมมติว่าเรามี /api/admin/payments สำหรับดึงข้อมูล
    // แต่เพื่อความง่าย จะจำลองข้อมูลขึ้นมา
    // const response = await fetch('/api/admin/payments'); 
    // const data = await response.json();
    const mockData = [
        { _id: '1', userId: 'user1', userEmail: 'user1@example.com', angpaoLink: 'https://gift.truemoney.com/...' },
        { _id: '2', userId: 'user2', userEmail: 'user2@example.com', angpaoLink: 'https://gift.truemoney.com/...' },
    ];
    setPayments(mockData);
    setIsLoading(false);
  };

  useEffect(() => {
    // Fetch pending payments when component mounts
    fetchPayments();
  }, []);

  const approvePayment = async (paymentId, userId) => {
    try {
      const response = await fetch('/api/approve-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, userId }),
      });
      const result = await response.json();
      if (result.success) {
        alert('อนุมัติสำเร็จ!');
        fetchPayments(); // Refresh list
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.error);
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading payments...</div>;
  }

  return (
    <div className="container mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">รายการรออนุมัติ (อั่งเปา)</h1>
      <div className="bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="grid grid-cols-3 gap-4 p-4 font-bold border-b border-gray-600">
          <div>อีเมลผู้ใช้</div>
          <div>ลิงก์ซอง</div>
          <div>จัดการ</div>
        </div>
        {payments.length > 0 ? (
          payments.map((p) => <PaymentRow key={p._id} payment={p} onApprove={approvePayment} />)
        ) : (
          <div className="p-8 text-center text-gray-400">ไม่มีรายการที่รออนุมัติ</div>
        )}
      </div>
    </div>
  );
}
