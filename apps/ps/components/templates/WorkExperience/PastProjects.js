import React from 'react';
import Div from '@ps/ui/components/Block';
import Link from '@ps/ui/components/Link';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faAngleLeft as faPrev } from '@fortawesome/pro-solid-svg-icons/faAngleLeft';
import { faAngleRight as faNext } from '@fortawesome/pro-solid-svg-icons/faAngleRight';
import { faPlay } from '@fortawesome/pro-solid-svg-icons/faPlay';
// import { useInView } from 'react-cool-inview';

const PastProjects = function () {
  // const { observe, unobserve, inView, scrollDirection, entry } = useInView();
  return (
    <Div>
      <article className="content">
        <h3 className="featured">2016-2017 - Luxul:</h3>
        <Div className="collage">
          <img
            loading="lazy"
            src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/luxul/collage.webp"
          />
        </Div>
        <Div className="description">
          <p>
            Designed and developed a new admin dashboard for Luxul brand
            electronic devices, using React, Redux, Webpack, Material-UI, and
            JSON-RPC. Designed mobile-first responsive UI. Developed open source
            own Material-UI form framework with state management and validation.
          </p>
        </Div>
      </article>

      <article className="content">
        <h3>2016 - All Events .NYC</h3>
        <Div
          className="image"
          onClick={() => {
            // $(this).hide();
            // $(this).next().show();
            // $(this).next().find('video')[0].play();
          }}
        >
          <img
            loading="lazy"
            src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/alleventsnyc/collage.webp"
          />
          <Div className="playbutton"></Div>
          <a className="playlink">
            <span>play screencapture </span>
            <FA icon={faPlay} />
          </a>
        </Div>
        <Div className="video" ss="display: none;">
          <video
            src="https://res.cloudinary.com/paulshorey/video/upload/v1627867214/ps/screencasts/alleventsnyc/video.webm"
            controls
            preload="none"
            poster="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screencasts/alleventsnyc/first.webp"
          ></video>
        </Div>
        <Div className="description">
          <p>
            Responsive AngularJS web app, made with Ionic, to work as a
            standalone iPhone and Android app too. An experiment in content
            curation and aggregation. NodeJS / PhantomJS bot constantly crawls
            the web, updating events in the database. After a busy workday, see
            what&apos;s going on in town. This crawling system and user
            interface can very quickly be adapted to any type of content or
            niche.
          </p>
        </Div>
      </article>

      <article className="content">
        <h3 className="featured">2015-2016 - YouNow</h3>
        <Div className="video">
          <video
            src="https://res.cloudinary.com/paulshorey/video/upload/v1627867214/ps/screencasts/younow/video.webm"
            controls
            preload="none"
            poster="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screencasts/younow/first.webp"
          ></video>
        </Div>
        <Div className="description">
          <p>
            Very cool live-video social network. Worked on an Agile team to
            constantly build new features and optimize the existing codebase,
            using the latest technology. <br />
            AngularJS, Gulp, WebSockets (Socket.io), custom streaming video
            player using HTML5, CSS3 fullscreen, animations,
            internationalization, etc.
            <Link
              href="http://younow.com"
              target="_blank"
              ss="font-weight: bold;"
            >
              YouNow.com
            </Link>
          </p>
        </Div>
      </article>

      <article className="content">
        <h3>2014 - Angular CMS</h3>
        <Div className="video">
          <video
            src="https://res.cloudinary.com/paulshorey/video/upload/v1627867214/ps/screencasts/angularcms/video.webm"
            controls
            preload="none"
            poster="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screencasts/angularcms/first.webp"
          ></video>
        </Div>
        <Div className="description">
          <p>
            Learning AngularJS, wanted to see what I can do, came up with an
            "angular" design for a custom content management system. Triangle
            shapes pointing from the top menu (dark blue), to the content menu
            (blue), to the content form (light blue). Great practice fitting a
            lot of functinality into a simple app.
          </p>
        </Div>
      </article>

      <article className="content">
        <h3>2014 - Carte Blanche Jazz Band</h3>
        <Div className="video">
          <video
            src="https://res.cloudinary.com/paulshorey/video/upload/v1627867214/ps/screencasts/carteblanchejazzband/video.webm"
            controls
            preload="none"
            poster="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screencasts/carteblanchejazzband/middle.webp"
          ></video>
        </Div>
        <Div className="description">
          <p>
            Fun website to promote a very cool band. An illustrator painted and
            scanned all these graphics. I made them dance on the screen.
            {/*    <Link href="http://CarteBlancheJazzBand.com" target="_blank">CarteBlancheJazzBand.com &raquo;</Link>*/}
          </p>
        </Div>
      </article>

      <article className="content">
        <h3>2014 - Shien Cosmetics</h3>
        <Div className="image">
          <img
            loading="lazy"
            src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/webdesigns/shiencosmetics.webp"
          />
        </Div>
        <Div className="description">
          <p>
            Custom designed Shopify e-commerce theme. Responsive, of course.
            <Link href="http://shiencosmetics.com/tv">
              ShienCosmetics.com &raquo;
            </Link>
          </p>
        </Div>
      </article>

      <article className="content">
        <h3>2014 - Photo gallery</h3>
        <Div className="video">
          <video
            src="https://res.cloudinary.com/paulshorey/video/upload/v1627867214/ps/screencasts/photo/video.webm"
            controls
            preload="none"
            poster="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screencasts/photo/first.webp"
          ></video>
        </Div>

        <Div className="description">
          <p>
            A proof-of-concept for an embeddable photography micro-app. Use the
            mouse or keyboard to browse categories and pictures.
          </p>
        </Div>
      </article>

      <article className="content">
        <h3 className="featured">2009-2014 - Focus Features Films</h3>
        <Div className="image">
          <Div
            className="cycle-slideshow"
            data-cycle-fx="scrollHorz"
            data-cycle-timeout="2000"
            data-cycle-prev="#focus-prev"
            data-cycle-next="#focus-next"
            data-cycle-pause-on-hover="true"
            data-cycle-log="false"
          >
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/1.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/11.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/3.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/12.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/4.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/2.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/5.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/6.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/7.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/8.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/9.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/focusfeatures/10.webp"
            />
          </Div>
          <Div ss="font-size: 16px; font-weight: bold;">
            <Link id="focus-prev">
              <FA icon={faPrev} /> PREV
            </Link>
            <Link id="focus-next" ss="float: right;">
              NEXT <FA icon={faNext} />
            </Link>
          </Div>
        </Div>
        <Div className="description">
          <p>
            Served as lead developer at this enterprise movie news site, until
            they closed the NYC office. Many people relied on it for movie and
            industry news. It later evolved to be more strictly mini-sites and
            marketing sites for individual feature films. I've made sites and
            apps for films like Moonrise Kingdom, Tinker Tailor Soldier Spy,
            Coraline, and Boxtrolls.
            <br />
            <b>
              <Link href="http://focusfeatures.com" target="_blank">
                FocusFeatures.com &raquo;
              </Link>
            </b>
          </p>
        </Div>
      </article>

      <article className="content">
        <h3 className="featured">2009-2014 - Focus Features</h3>
        <Div className="video">
          <video
            src="https://res.cloudinary.com/paulshorey/video/upload/v1627867214/ps/screencasts/focusfeaturestv/video.webm"
            controls
            preload="none"
            poster="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screencasts/focusfeaturestv/first.webp"
          ></video>
        </Div>
        <Div className="description">
          <p>
            Google TV was supposed to be the next big thing: a smart TV that
            searched content from all over the web, and had channels like Roku
            and Samsung do. I developed a prototype for a Tv channel. It runs in
            a modified the Chrome browser, as most other Google inventions. But
            the user would only have the arrow keys, "enter" and "esc" to
            navigate it.
            <Link href="http://focusfeatures.com/tv">
              FocusFeatures.com/TV &raquo;
            </Link>
          </p>
        </Div>
      </article>
      {/* <Link name="early_works"></Link> */}

      <article className="content">
        <h3>2008 - User Friendly CMS</h3>
        <Div className="video">
          <video
            src="https://res.cloudinary.com/paulshorey/video/upload/v1627867214/ps/screencasts/userfriendlycms/video.webm"
            controls
            muted
            preload="none"
            poster="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screencasts/userfriendlycms/first.webp"
          ></video>
        </Div>
        <Div className="description">
          <p>
            Before Wordpress re-designed their UI in 2009, it was difficult to
            use, though not as difficult as Joomla/Droopal/Typo3. Back then it
            was an tedious work for independent website owners to manage their
            site using a full featured CMS. I designed and developed this "easy"
            CMS for my clients. Made with PHP/MySQL on the backend and jQuery UI
            on the front. It is built into the site itself. It uses custom html
            tags that lay dormant until the user signs in. Since then, most of
            my clients migrated to SquareSpace and Shoppify. But, the CMS and
            demo site are still running.
          </p>
        </Div>
      </article>

      <article className="content">
        <h3>2009 - Early websites</h3>
        <Div className="image">
          <Div
            className="cycle-slideshow"
            data-cycle-fx="scrollHorz"
            data-cycle-timeout="2000"
            data-cycle-prev="#early-prev"
            data-cycle-next="#early-next"
            data-cycle-pause-on-hover="true"
            data-cycle-log="false"
          >
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/early_designs/1.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/early_designs/2.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/early_designs/3.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/early_designs/4.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/early_designs/5.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/early_designs/6.webp"
            />
            <img
              loading="lazy"
              src="https://res.cloudinary.com/paulshorey/image/upload/g_auto,c_fill,w_1056/v1627867206/ps/screenshots/early_designs/7.webp"
            />
          </Div>
        </Div>
        <Div className="description">
          <p>
            Back in 2008/2009 I made sites for some artists and small
            businesses, while finishing College. Used my own DIY PHP CMS
            platform, the UserFriendlyCMS described in the previous post. All
            sites I made early on have now been replaced by SquareSpace,
            Shopify, or Wix.
          </p>
          <p>
            <b>Thank you for scrolling down so far!</b> Fun easter-egg for you -
            here is one of the very first websites I created, in 2005, while in
            high-school, to showcase my mommy's artworks and mural paintings:
            <Link href="http://lanasgallery.com" target="_blank">
              Lana's Gallery
            </Link>
          </p>
        </Div>
      </article>
    </Div>
  );
};

export default PastProjects;
