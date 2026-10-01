import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1️⃣ المسارات المحمية التي تتطلب تسجيل دخول
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // 2️⃣ إذا كان المسار محمياً ولا يوجد توكن -> التوجيه إلى صفحة تسجيل الدخول
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3️⃣ إذا كان المستخدم مسجلاً بالفعل وحاول الدخول لصفحة التسجيل -> توجيهه إلى الـ Dashboard
  if (pathname === '/login' && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  const response = NextResponse.next();

  // 4️⃣ إضافة تعلييمات منع التخزين المؤقت (Cache-Control) للصفحات المحمية لمنع الرجوع والتقدم من ذاكرة المتصفح
  if (isProtectedRoute) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
};