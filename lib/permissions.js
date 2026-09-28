// lib/permissions.js

export const PERMISSIONS = {
  DOCTOR_MANAGEMENT: 'bölüm ve doktor yönetimi',
  DOCTOR_EDIT: 'bölüm ve doktor düzeltme yetkisi',
  DOCTOR_DELETE: 'bölüm ve doktor silme yetkisi',
  WORK_STATUS_CHANGE: 'çalışma durumu değiştirme',
  REPORT_MANAGEMENT: 'sorun bildirme yönetimi',
};

/**
 * فحص هل لدى المستخدم صلاحية معينة
 * @param {Object} user - كائن المستخدم
 * @param {string} permissionKey - مفتاح الصلاحية المطلوب فحصها
 */
export function hasPermission(user, permissionKey) {
  if (!user) return false;

  // المسؤول الرئيسي (ADMIN/YÖNETİCİ) يملك كافة الصلاحيات دائماً
  const roleUpper = user.role?.toUpperCase() || '';
  const usernameUpper = user.username?.toUpperCase() || '';
  if (roleUpper === 'ADMIN' || roleUpper === 'YÖNETİCİ' || usernameUpper === 'ADMIN') {
    return true;
  }

  // 1. إذا كانت الصلاحيات محفوظة كـ Object
  if (user.permissions && typeof user.permissions === 'object') {
    if (user.permissions[permissionKey] === true) return true;
    
    // فحص التوافقية مع المفاتيح القديمة
    if (permissionKey === PERMISSIONS.DOCTOR_MANAGEMENT && user.permissions.canEditDoctors) return true;
    if (permissionKey === PERMISSIONS.DOCTOR_DELETE && user.permissions.canDeleteDoctors) return true;
    if (permissionKey === PERMISSIONS.WORK_STATUS_CHANGE && user.permissions.canChangeStatus) return true;
    if (permissionKey === PERMISSIONS.REPORT_MANAGEMENT && user.permissions.canManageIssues) return true;
  }

  // 2. إذا كانت الصلاحيات محفوظة كمصفوفة Array
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(permissionKey);
  }

  return false;
}