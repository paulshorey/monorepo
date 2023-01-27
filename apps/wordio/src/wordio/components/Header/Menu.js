import Link from "@techytools/ui/components/Link";
import { withBlock } from "@techytools/ui/components/Block";
import Button from "@techytools/ui/components/Button";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { faPlay } from "@fortawesome/pro-regular-svg-icons";

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
        <Button ss="margin:0 0.25rem 1rem 1rem" bggradient="cool">
          API Documentation
        </Button>
      </Link>
      <Button ss="margin:0 0.25rem 1rem 1rem" icon={<FA icon={faCode} />} textcolor="cool" variant="outlined">
        Playground
      </Button>
      <Link href="/thesaurus?str=howdy">
        <Button ss="margin:0 0.25rem 0.5rem 1rem" icon={<FA icon={faPlay} />} textcolor="cool" variant="outlined">
          Demo
        </Button>
      </Link>
      <Link href="#">
        <Button ss="margin:0 -0.75rem 0 1rem" textcolor="cool" variant="text">
          About us
        </Button>
      </Link>
      <Link href="#">
        <Button ss="margin:0 -0.75rem 0 1rem" textcolor="cool" variant="text">
          Contact
        </Button>
      </Link>
      <Link href="#">
        <Button ss="margin:0 -0.75rem 0 1rem" textcolor="cool" variant="text">
          Pricing
        </Button>
      </Link>
    </Menu>
  );
};
export default DropdownMenu;
