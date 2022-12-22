// import Link from '@ps/ui/components/Link';
import CenterChildrenY from '@ps/ui/components/CenterChildrenY';
import CenterChildrenX from '@ps/ui/components/CenterChildrenX';
import { analytics_track_page } from '@ps/fn/browser/analytics';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    analytics_track_page({
      name: 'Search widget',
      path: '/widgets/search',
    });
  }, []);
  return (
    <CenterChildrenY ss="height:100vh;background: linear-gradient(135deg, #4c98e4 10%, #856b98);">
      <CenterChildrenX>Search bar goes here</CenterChildrenX>
    </CenterChildrenY>
  );
}
