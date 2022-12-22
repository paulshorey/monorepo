import HomeTemplate from 'components/templates/Home';
import Link from '@ps/ui/components/Link';
import CenterChildrenY from '@ps/ui/components/CenterChildrenY';
import CenterChildrenX from '@ps/ui/components/CenterChildrenX';
import { analytics_track_page } from '@ps/fn/browser/analytics';
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
