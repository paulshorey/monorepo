import React, { useRef } from "react";
import DomainSedo from "./DomainSedo";
import DomainAfternic from "./DomainAfternic";
import { SedoStyled } from "./styled";

export default ({ from, domains, str, tld }) => {
  const ref = useRef(null);
  if (!from || !domains || (!domains.coms && !domains.alts)) return null;
  let coms = domains.coms;
  let alts = domains.alts;
  if (!coms.length && !alts.length) {
    return null;
  }
  const DomainComponent = from === "afternic" ? DomainAfternic : DomainSedo;
  return (
    <SedoStyled ref={ref}>
      <div>
        {alts.map((domain) => (
          <DomainComponent domain={domain} />
        ))}
      </div>
      <div>
        {coms.map((domain) => (
          <DomainComponent domain={domain} />
        ))}
      </div>
      <div className="controls">
        <DomainComponent more={true} str={str} tld={tld} />
      </div>
    </SedoStyled>
  );
};
