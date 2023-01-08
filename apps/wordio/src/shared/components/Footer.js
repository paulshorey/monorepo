import Link from "next/link";
// import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
// import { faBolt } from "@fortawesome/pro-solid-svg-icons/faBolt";
// import { _ } from "src/shared/containers/Domains/Domains.styled";
import React from "react";
import { StyledFooter } from "./Footer.styled.js";

export default () => (
  <StyledFooter>
    <div className="footerCopyright">
      <p className="content">
        Built with ❤️&nbsp; by{" "}
        <Link href="/about" className="color-accent">
          <a>Paul + Samira</a>
        </Link>
        . All rights reserved. By using this site, you agree not to programmatically collect our content. Thanks a lot
        for visiting!
      </p>
    </div>
  </StyledFooter>
);
