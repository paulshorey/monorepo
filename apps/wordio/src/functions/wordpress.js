import { analytics_track_link } from 'src/functions/analytics';
import { href_canonical } from 'src/functions/window';

/**
 * Helper to find the best img src from wordpress content
 * @param post {object} - optional, but recommended
 *    if both post and media are defined, this component will get src from them
 *    this is better than passing in src, because this will get the Cloudinary CDN file
 * @param media {object} - optional, but recommended
 *    if both post and media are defined, this component will get src from them
 *    this is better than passing in src, because this will get the Cloudinary CDN file
 */
export const imageSrcFromWordpress = function ({ post, media }) {
  let file;
  let src = '';
  if (media && post) {
    // find the best possible value
    const isFeatured = (file) => file.id === post.featured_media;
    file = media.find(isFeatured);
    if (file?.source_url) {
      src = file.source_url;
    }
  }
  if (post && !src) {
    // use alternative value
    src = post.jetpack_featured_media_url;
  }

  // fix broken wordpress hosted images
  if (src && src.includes('blogspiralus.wpcomstaging.com/wp-content')) {
    // serve from cloudinary
    let filename = src.split('/').pop();
    let fileextension = filename.split('.').pop();
    let lowercase = fileextension.toLowerCase();
    if (
      !(
        lowercase === 'jpeg' ||
        lowercase === 'jpg' ||
        lowercase === 'png' ||
        lowercase === 'gif' ||
        lowercase === 'webp' ||
        lowercase === 'svg'
      )
    ) {
      fileextension = ''; // invalid file extension (no extension, and dot in filename)
    }
    if (fileextension) {
      filename = filename.substring(0, filename.length - fileextension.length - 1);
    }
    let filenameShort = filename.substring(0, 31);
    if (!/\w\d/.test(filenameShort.substr(-1))) {
      filenameShort = filenameShort.substring(0, filenameShort.length - 1);
    }
    src =
      'https://res.cloudinary.com/spiral/images/wordpress-uploads/' +
      filenameShort +
      '/' +
      filename +
      '-' +
      fileextension;
    src = src.trim();
    if (src.substr(-1) === '-') {
      src = src.substring(0, src.length - 1);
    }
  }

  // remove extra nonsense added by Wordpress
  let cut = src.indexOf('?');
  if (cut !== -1) {
    src = src.substring(0, cut);
  }

  return src;
};

/**
 * Modifies the DOM of the page on page loaded.
 * Only need to do this for Wordpress API content -
 * all other links (made in React) use Atom/Link component, and are already correct, already being tracked.
 */
export const fixLinks = function () {
  if (typeof window === 'object') {
    /*
     * Modify <a> links
     */
    let links = document.querySelectorAll('#wordpressContent a');
    Array.prototype.forEach.call(links, function (link) {
      let href = href_canonical(link.href) || '';
      try {
        /*
         * Fix Twitter share text
         */
        if (href.includes('twitter.com/share')) {
          let i1 = href.indexOf('text=') + 5;
          let i2 = href.indexOf('&url=');
          if (i1 > 5 && i2 > -1) {
            let html = href.substring(i1, i2);
            try {
              html = decodeURIComponent(unescape(html));
            } catch (e) {
              html = decodeURIComponent(html);
            }
            let div = document.createElement('div');
            div.innerHTML = html;
            let text = div.innerText || div.textContent || '';
            // remove special characters that will not be fixed by escape() or encodeURIComponent()
            text = text.replace(/â/g, '’');
            text = text.replace(/â/g, ' – ');
            text = text.replace(/|||[âÂ¹²³⁴⁵⁶⁷⁸⁹⁰]+/g, '');
            text = text.replace(/[\s]+/g, ' ');
            text = encodeURIComponent(text);
            // text = text.replace(/&nbsp;|\s/gi, ' '); // space removal not working!
            link.classList.add('tweetButton');
            href = href.replace(href.substring(i1, i2), text);
          }
        }

        /*
         * Fix link href, target, ref
         * (always use _blank for external links)
         */
        if (
          href.substring(0, 4) === 'http' &&
          !href.substring(0, 22).includes('spiral.us')
          // && !href.includes('1526316317')
        ) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        } else if (href.includes('/#') || href[0] === '#') {
          link.setAttribute('target', '');
        } else {
          link.setAttribute('href-lang', 'en-us');
          link.setAttribute('target', '');
          link.setAttribute('rel', '');
        }

        /*
         * Track links
         */
        link.href = href;
        link.onclick = function (event) {
          analytics_track_link({ href: href, from: 'wordpress' });
        };
      } catch (e) {
        console.error(`unable to modify link href="${href}" html="${link.innerHTML}"`);
      }
    });
    /*
     * Add <a name=""> before each Heading, so we can link to different sections on the page
     */
    let headings = [
      ...[...document.getElementsByTagName('h1')],
      ...[...document.getElementsByTagName('h2')],
      ...[...document.getElementsByTagName('h3')],
      ...[...document.getElementsByTagName('h4')],
      ...[...document.getElementsByTagName('h5')],
      ...[...document.getElementsByTagName('h6')],
    ];
    Array.prototype.forEach.call(headings, function (heading) {
      heading.style.position = 'relative';
      if (heading.classList.contains('thePostTitle')) return;

      let aname = heading.innerText
        .replace(/\s/g, ' ')
        .replace(/[ ]+/g, ' ')
        .replace(/([^a-z0-9 ]+)/gi, '')
        .replace(/^ /, '')
        .replace(/ $/, '')
        .trim();
      if (!document.querySelector(`[name="${aname}"]`)) {
        let anchor = document.createElement('a');
        anchor.setAttribute('name', aname);
        anchor.classList.add('aname');
        heading.prepend(anchor);
      }
      let anameNoUpper = aname.toLowerCase();
      if (!document.querySelector(`[name="${anameNoUpper}"]`)) {
        let anchor = document.createElement('a');
        anchor.setAttribute('name', anameNoUpper);
        anchor.classList.add('aname');
        heading.prepend(anchor);
      }
      let anameNoNumbers = aname
        .replace(/([^a-z ]+)/gi, '')
        .replace(/[ ]+/g, ' ')
        .trim();
      if (!document.querySelector(`[name="${anameNoNumbers}"]`)) {
        let anchor = document.createElement('a');
        anchor.setAttribute('name', anameNoNumbers);
        anchor.classList.add('aname');
        heading.prepend(anchor);
      }
      let anameNoUpperNoNumbers = aname
        .replace(/([^a-z ]+)/gi, '')
        .toLowerCase()
        .replace(/[ ]+/g, ' ')
        .trim();
      if (!document.querySelector(`[name="${anameNoUpperNoNumbers}"]`)) {
        let anchor = document.createElement('a');
        anchor.setAttribute('name', anameNoUpperNoNumbers);
        anchor.classList.add('aname');
        heading.prepend(anchor);
      }
    });
  }
};
