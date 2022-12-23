import WorkExperience from 'components/templates/WorkExperience';
import { useEffect } from 'react';
import { analytics_track_page } from '@techytools/fn/browser/analytics';

const Page = (props) => {
  useEffect(() => {
    analytics_track_page({
      name: 'Experience',
      path: '/experience',
    });
  }, []);
  return (
    <div>
      Work Experience
      <WorkExperience {...props} />
    </div>
  );
};

export default Page;
