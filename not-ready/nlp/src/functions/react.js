import Link from '@atoms/Link';

export const makeLinks = function ({ paths, currentPath }) {
  // remove junk from url (query string, anchor name)
  let iTrailingSlash = currentPath.lastIndexOf('/');
  if (iTrailingSlash !== -1) {
    let afterSlashChar = currentPath.substring(iTrailingSlash + 1, iTrailingSlash + 2);
    if (afterSlashChar === '?' || afterSlashChar === '#') {
      currentPath = currentPath.substring(0, iTrailingSlash);
    }
  }
  // path[0] = label (link text)
  // path[1] = href (link url)
  // path[2] = starts with (optional, url will be marked active if starts with this url)
  return paths.map((path, i) => {
    // compare only path[2] (preferred) or path[1], not both!
    let active = false;
    if (path.isActive) {
      active = true;
    } else if (path[2]) {
      if (path[2] === currentPath.substring(0, path[2].length)) {
        active = true;
      }
    } else if (path[1] === currentPath) {
      active = true;
    } else if (path[0] === 'Home' && currentPath === '/') {
      active = true;
    }
    return (
      <Link key={path + i} href={path[1]} className={active ? 'is-active' : ''}>
        {path[0]}
      </Link>
    );
  });
};
