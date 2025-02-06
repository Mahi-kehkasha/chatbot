export const getAvatarUrl = (name, size = 128) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=random&color=fff&size=${size}`;
};
