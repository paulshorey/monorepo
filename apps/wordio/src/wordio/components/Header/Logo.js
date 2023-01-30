import Link from "@techytools/ui/components/Link";
import { StyledLogoLink } from "./index.styled";
const _ = () => <span style={{ width: "5px" }} />;

const Logo = ({ home }) => {
  if (!!home) {
    return (
      <StyledLogoLink>
        <Link
          href="/"
          onClick={() => {
            setTimeout(function () {
              if (typeof window === "object") window.scrollTo({ top: 0, behavior: "smooth" });
            }, 300);
          }}
        >
          <span className="color-accent">wordio</span>
          <span className="color-white">
            .<_ />
            co
          </span>
          <span className="beta">beta</span>
        </Link>
      </StyledLogoLink>
    );
  } else {
    return (
      <StyledLogoLink>
        <Link href="/">
          <span className="color-accent">wordio</span>
          <span className="color-white">
            .<_ />
            co
          </span>
          <span className="beta">beta</span>
        </Link>
      </StyledLogoLink>
    );
  }
};
export default Logo;
