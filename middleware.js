import { NextResponse } from 'next/server';

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // جلب الجلسة والدور من الكوكيز
  const userSessionCookie = request.cookies.get('user_session')?.value;
  const userRole = request.cookies.get('user_role')?.value?.toUpperCase();

  const isAuthenticated = !!userSessionCookie;

  // 1. مسارات الوصول العام بدون قيود
  if (pathname === '/' || pathname === '/login' || pathname === '/schedule') {
    return NextResponse.next();
  }

  // 2. إذا لم يكن المستخدم مسجلاً دخوله، يتم تحويله لصفحة التسجيل
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. حماية مسارات الإدارة العامة (/admin/users وغيرها)
  // السماح للمدراء (ADMIN / YÖNETİCİ) واستثناء صفحة الأطباء لتفحص داخلياً
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/doctors')) {
    const isAllowedAdmin = userRole === 'ADMIN' || userRole === 'YÖNETİCİ';
    if (!isAllowedAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|public|.*\\..*).*)',
  ],
};