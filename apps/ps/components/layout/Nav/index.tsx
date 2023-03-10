// import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
// import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
// import Button from '@techytools/ui/components/Button';
// import Link from '@techytools/ui/components/Link';
// import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import Block, { withBlock } from '@techytools/ui/components/Block';
import styles from './index.styles';
import NavDropdown from '../NavDropdown';

const LayoutNav = () => {
  return (
    <Block as="nav" ss={styles}>
      {/* <Link
        href="https://paulshorey.com/files/Resume--Paul-Shorey.pdf"
        ss="margin-right:1.3rem;text-align:right;"
      >
        <Button variant="text">
          Resume <FA icon={regular('download')} />
        </Button>
      </Link> */}

      {/* <Link
        href="https://github.com/paulshorey/monorepo"
        target="_blank"
        rel="noopener noreferrer"
        ss="margin-right:0.875rem;text-align:right;"
      >
        <Button variant="text" ss="font-size:1.5rem;">
          <FA icon={faGithub} />
        </Button>
      </Link> */}

      <NavDropdown />
    </Block>
  );
};

export default LayoutNav;
