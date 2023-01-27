import { StyledRightHamburger } from "./index.styled";
import { faBars } from "@fortawesome/pro-regular-svg-icons/faBars";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import Dropdown from "@techytools/ui/components/Dropdown";
import Menu from "./Menu";

export default () => {
  return (
    <Dropdown as="span" textcolor="accent" right menu={<Menu />}>
      <StyledRightHamburger className="StyledRightHamburger">
        <FA icon={faBars} className="faBars" />
      </StyledRightHamburger>
    </Dropdown>
  );
};
