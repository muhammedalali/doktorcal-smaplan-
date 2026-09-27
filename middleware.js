import { NextResponse } from 'next/server';

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. جلب كوكيز الجلسة والدور
  const userSessionCookie = request.cookies.get('user_session')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  const isAuthenticated = !!userSessionCookie;

  // 2. السماح الفوري لصفحة تسجيل الدخول والصفحة الرئيسية والجدول بدون أي معالجة توجيه
  if (pathname === '/' || pathname === '/login' || pathname === '/schedule') {
    return NextResponse.next();
  }

  // 3. حماية المسارات المحمية فقط (مثل /dashboard, /admin, /profile, /report)
  // إذا لم يكن المستخدم مسجلاً لدخوله، اطرده لصفحة اللوجن
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. حماية مسارات الأدمن حصراً (/admin/...)
  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// استثناء الملفات الثابتة والصور وأيقونات النظام والـ API لمنع التعارض
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|public|.*\\..*).*)',
  ],
};