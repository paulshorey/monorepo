import React, { useState, useEffect } from "react";
import { DomainStyled } from "./styled";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/pro-solid-svg-icons/faCaretDown";

export default ({ more, domain, str, tld }) => {

  if (!!more) {
    return (
      <a
        className={""}
        target="_blank"
        href={`https://www.afternic.com/search?k=${str}.${tld}`}
      >
        See more from Afternic <FA className="fa-angle-down" icon={faCaretDown} />
      </a>
    );
  }
  if (!domain) return null;

  return (
    <>
      <DomainStyled
        className={""}
        target="_blank"
        href={`https://www.afternic.com/search?k=${domain.name}`}
        // href={`https://sedo.com/checkdomainoffer.php?language=us&domain=${domain.name}&language=us&campaignId=326988`}
      >
        <b>{domain.name}</b> (<b>${domain.price}</b>)
      </DomainStyled>{" "}
    </>
  );
};
