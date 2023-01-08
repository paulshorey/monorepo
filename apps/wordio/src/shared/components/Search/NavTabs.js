import React from "react";
import Link from "next/link";
import { StyledLinks } from "./NavTabs.styled";
import { withRouter } from "next/router";

let admin_links = {
  // "edit_word": {title: "Edit word", page: "edit_word"},
  // "add_word_to_others": {title: "Add to words", page: "add_word_to_others"},
  // "edit_domain": {title: "Edit domain", page: "edit_domain"},
};
let links = [
  { title: "Salad", page: "salad" },
  { title: "Edit domain extension", page: "edit_domain" },
  // {title: "Add word to others", page: "add_word_to_others"},
  { title: "Thesaurus", page: "thesaurus" },
  { title: "Edit Word", page: "edit_word" }
];

class ThisComponent extends React.Component {
  render() {
    let TopLinks = [];
    for (let link of [...links, ...Object.values(admin_links)]) {
      // navigate to new page
      // /{new_page}/{word_input}
      let pathlist = [""];
      pathlist[1] = link.page;
      pathlist[2] = this.props.word_input;
      let link_path = pathlist.join("/");
      // has search term ?
      let search_term = pathlist[2];
      // is_selected
      let is_selected = this.props.router.asPath.includes(link.page + "/") ? link.title : "";
      // is_admin
      let is_admin = !!admin_links[link.page];
      if (is_admin && !is_selected) {
        continue;
      }
      // add link
      TopLinks.push(
        <li
          ref={is_selected ? "SearchPageSelected" : undefined}
          key={link_path}
          className={(is_admin ? " admin" : "") + (is_selected ? " selected" : " hideIf_lt_full")}
        >
          <Link href={link_path || ""}><a>{link.title}</a></Link>
        </li>
      );
      // persist search term
      // only if appeared on selected "search" page
      // then it was a real "search term" and not just a "second url component"
      if (is_selected && search_term) {
        this.props.set_redux_word_input(search_term);
      }
      // page title
      if (is_selected && typeof window === "object") {
        window.document.title = `${search_term} ${search_term && is_selected && " :: "} ${is_selected.toLowerCase()}`;
      }
    }
    // display each Link
    return <StyledLinks className={"scrollable noselect"}>{TopLinks}</StyledLinks>;
  }
}

export default withRouter(ThisComponent);
