'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('خطأ في الدخول: تأكد من البيانات أو تفعيل الحساب');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dir-rtl">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-lg">
        <h2 className="text-center text-3xl font-bold text-blue-600">تسجيل الدخول</h2>
        <p className="text-center text-gray-500">نظام تقييم المنشآت الخرسانية - برو</p>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-center text-red-500 text-sm">{error}</p>}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-right"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-right"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 transition"
          >
            دخول المهندسين
          </button>
        </form>
      </div>
    </div>
  );
}
