'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProject() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [floors, setFloors] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location, floors: Number(floors) }),
    });

    if (response.ok) {
      router.push('/dashboard');
    } else {
      alert('حدث خطأ أثناء حفظ المشروع');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-4">
          تعريف مشروع تقييم جديد
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنشأة / المشروع</label>
            <input
              type="text"
              required
              className="w-full rounded-md border border-gray-300 p-2 text-right"
              placeholder="مثال: عمارة سكنية - حي المزة"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الموقع الجغرافي</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 p-2 text-right"
              placeholder="المدينة / المنطقة"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عدد الطوابق</label>
            <input
              type="number"
              min="1"
              required
              className="w-full rounded-md border border-gray-300 p-2 text-right"
              value={floors}
              onChange={(e) => setFloors(Number(e.target.value))}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ المشروع والبدء بالتقييم'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
