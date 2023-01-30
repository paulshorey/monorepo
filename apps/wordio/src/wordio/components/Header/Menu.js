import Link from "@techytools/ui/components/Link";
import { withBlock } from "@techytools/ui/components/Block";
import Button from "@techytools/ui/components/Button";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { faCode, faSearch } from "@fortawesome/free-solid-svg-icons";
// import { faPlay } from "@fortawesome/pro-regular-svg-icons";

const Menu = withBlock({
  componentName: "Menu",
  textcolor: "accent",
  bggradient: "light",
  ss: `
    border-radius: 0.5rem;
    padding: 1rem;
    margin: 0;
    a {
      display: block;
    }
  `,
});

const DropdownMenu = () => {
  return (
    <Menu>
      <Link href="https://documenter.getpostman.com/view/23360867/2s8YzXtewC">
        <Button ss="margin:0 0.25rem 1rem 1rem" icon={<FA icon={faCode} />} bggradient="cool">
          API Documentation
        </Button>
      </Link>
      <Button ss="margin:0 0.25rem 1rem 1rem" icon={<FA icon={faSearch} />} textcolor="cool" variant="outlined">
        Domain Search App
      </Button>
      <Link href="#">
        <Button ss="margin:0 -0.6rem 0 1rem" textcolor="cool" variant="link">
          API Endpoints
        </Button>
      </Link>
      <Link href="#">
        <Button ss="margin:0 -0.6rem 0 1rem" textcolor="cool" variant="link">
          About us
        </Button>
      </Link>
      <Link href="#">
        <Button ss="margin:0 -0.6rem 0 1rem" textcolor="cool" variant="link">
          Contact
        </Button>
      </Link>
      <Link href="#">
        <Button ss="margin:0 -0.6rem 0 1rem" textcolor="cool" variant="link">
          Pricing
        </Button>
      </Link>
    </Menu>
  );
};
export default DropdownMenu;
