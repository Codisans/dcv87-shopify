export const isExternalLink = (url) => {
  if (url === '') return false;

  const link = document.createElement('a');
  link.href = url;
  return link.hostname !== window.location.hostname;
};
