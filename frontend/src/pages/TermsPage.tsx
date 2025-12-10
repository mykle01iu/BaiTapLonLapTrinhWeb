// src/pages/TermsPage.tsx
export const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Điều khoản dịch vụ</h1>
      <div className="space-y-4 text-gray-700">
        <p>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Chấp nhận điều khoản</h2>
          <p>Bằng cách sử dụng Expense Tracker, bạn đồng ý với các điều khoản này.</p>
        </section>
        
        {/* ... thêm các sections ... */}
      </div>
    </div>
  );
};