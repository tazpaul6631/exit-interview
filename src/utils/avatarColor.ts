export const AVATAR_COLORS = [
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#009688',
  '#4CAF50',
  '#FF9800',
  '#795548',
  '#607D8B',
  '#E53935',
] as const;

/** Màu cố định theo id user — cùng user thì cùng màu cho đến khi logout. */
export const getAvatarColorByUserId = (userId: string | number | null | undefined): string => {
  if (userId == null || String(userId).trim() === '') {
    return AVATAR_COLORS[0];
  }

  const seed = String(userId);
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
