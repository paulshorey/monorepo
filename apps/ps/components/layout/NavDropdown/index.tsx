import Dropdown from '@techytools/ui/components/Dropdown';
// import ColorSchemeToggle from './ColorSchemeToggle';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import Button from '@techytools/ui/components/Button';
import CenterChildrenY from '@techytools/ui/components/CenterChildrenY';
import Block, { withBlock } from '@techytools/ui/components/Block';
import styles from './index.styles';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import Link from '@techytools/ui/components/Link';

const LayoutNav = () => {
  return (
    <Dropdown
      right
      menu={
        <Block bggradient="purple" textcolor="light" ss={styles}>
          {/* <Button
            variant="text"
            onClick={() => {
              // setIsOpen(true);
            }}
            className="noWrap"
          >
            experience &amp; experiments <FA icon={regular('angle-down')} />
          </Button> */}
          {/* <Button
            variant="text"
            onClick={() => {
              // setIsOpen(true);
            }}
            className="noWrap"
          >
            docs &amp; notes <FA icon={regular('angle-down')} />
          </Button> */}
          <Link href="https://github.com/paulshorey/monorepo">
            <Button variant="text" className="noWrap">
              github <FA icon={faGithub} />
            </Button>
          </Link>
          <Link href="https://paulshorey.com/files/Resume--Paul-Shorey.pdf">
            <Button variant="text" textcolor="accent">
              <span>resume </span>
              <FA icon={regular('file-arrow-down')} />
            </Button>
          </Link>
          {/* <Button
            variant="text"
            textcolor="accent"
            onClick={() => {
              const el = window.document.querySelector(
                '[class*="FloatingButton__FloatingButtonContainer"] button'
              );
              // @ts-ignore
              if (el && el.click) el.click();
            }}
            ss="svg { transform: scale(1.15) translate(0.075rem, 0.05rem); }"
          >
            <span>say hello </span>
            <FA icon={regular('message')} />
          </Button> */}
        </Block>
      }
    >
      <CenterChildrenY>
        <FA
          icon={solid('bars')}
          style={{ fontSize: '1.6rem', marginTop: '0' }}
        />
      </CenterChildrenY>
    </Dropdown>
  );
};

export default LayoutNav;
