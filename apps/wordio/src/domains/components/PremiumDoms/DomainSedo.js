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
        href={`https://sedo.com/search/?keyword=${str}.${tld}&price_end=1000&price_start=10&len_max=7&campaignId=326988`}
      >
        See more from Sedo <FA className="fa-angle-down" icon={faCaretDown} />
      </a>
    );
  }
  if (!domain) return null;

  return (
    <>
      <DomainStyled
        className={""}
        target="_blank"
        href={`https://sedo.com/search/?keyword=${domain.name}&campaignId=326988`}
        // href={`https://sedo.com/checkdomainoffer.php?language=us&domain=${domain.name}&language=us&campaignId=326988`}
      >
        <b>{domain.name}</b> (<b>${domain.price}</b>)
      </DomainStyled>{" "}
    </>
  );
};
