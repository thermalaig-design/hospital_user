const normalizeAudience = (value) => String(value || '').trim().toLowerCase();

export const getUserIdVariants = (rawUser) => {
  const variants = new Set();
  const base = String(rawUser || '').trim();
  if (base) variants.add(base);

  const digits = base.replace(/\D/g, '');
  if (digits) {
    variants.add(digits);
    if (digits.length >= 10) variants.add(digits.slice(-10));
    if (!digits.startsWith('91') && digits.length === 10) variants.add(`91${digits}`);
    variants.add(`+${digits}`);
    if (digits.length === 10) variants.add(`+91${digits}`);
  }

  return [...variants].filter(Boolean);
};

const getMemberTypeVariants = (rawType) => {
  const normalized = normalizeAudience(rawType);
  if (!normalized) return [];

  if (normalized === 'trustee' || normalized === 'trustees') {
    return ['Trustee', 'trustee', 'Trustees', 'trustees'];
  }
  if (normalized === 'patron' || normalized === 'patrons') {
    return ['Patron', 'patron', 'Patrons', 'patrons'];
  }

  const original = String(rawType).trim();
  return [original, normalized];
};

export const getCurrentNotificationContext = () => {
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const userId = user ? user.Mobile || user.mobile || user.id : null;
  const userIdVariants = getUserIdVariants(userId);
  const memberTypeVariants = getMemberTypeVariants(user?.type || user?.Type);
  const audienceVariants = [...new Set(['all', 'All', 'both', 'Both', ...memberTypeVariants])];
  const audienceNormalizedSet = new Set(audienceVariants.map(normalizeAudience).filter(Boolean));
  const userIdSet = new Set(userIdVariants.map((value) => String(value || '').trim()).filter(Boolean));

  return {
    userId,
    userIdVariants,
    audienceVariants,
    audienceNormalizedSet,
    userIdSet,
  };
};

export const matchesNotificationForContext = (notification, context) => {
  if (!notification || !context) return false;

  const notificationUserId = String(notification.user_id || '').trim();
  if (notificationUserId && context.userIdSet.has(notificationUserId)) return true;

  const audience = normalizeAudience(notification.target_audience);
  if (audience && context.audienceNormalizedSet.has(audience)) return true;

  return false;
};
