import HomeTemplate from 'components/templates/Home';
import Link from '@techytools/ui/components/Link';
import CenterChildrenY from '@techytools/ui/components/CenterChildrenY';
import CenterChildrenX from '@techytools/ui/components/CenterChildrenX';
import { analytics_track_page } from '@techytools/fn/browser/analytics';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    analytics_track_page({
      name: '404',
      path: '/*',
    });
  }, []);
  return (
    <>
      <CenterChildrenY ss="height:100vh;">
        <CenterChildrenX>
          <h2>Page Not Found</h2>
          <p>
            <Link href="/">Click here to go back to the homepage</Link>
          </p>
        </CenterChildrenX>
      </CenterChildrenY>
      <HomeTemplate />
    </>
  );
}
