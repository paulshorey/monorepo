import React from "react";
import { DomsStyled } from "./Doms.styled";
import Doms from "./Doms";
import { arrays_mix } from "@techytools/fn/io/arrays";
import strings_shuffle_first2 from "@techytools/fn/io/strings/strings_shuffle_first2";

let DEBUG1 = true;
class DomsIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    /*
     *
     * User "container" state/props/methods!
     * This "child" component is to simplify container's render() logic.
     *
     */
    let {
      OriginalMessage = null,
      domains_generic = [],
      domain_suggested = {},
      domain_availability = {},
      ui = {},
      input_tld = "",
      input_str = "",
      input_spellchecked = "",
      tlds_checked = [],
      input_words_arr = [],
    } = this.props;
    let suggestions_keys = ["generic", "tld", "com", "word hack", "phrase hack", "name"];
    let suggestions_lists = domain_suggested;
    if (!suggestions_lists["generic"]) {
      suggestions_lists["generic"] = domains_generic;
    }
    // suggestions_lists["all"] = [...domains_generic, ...(suggestions_lists["all"] || [])]
    if (!suggestions_lists["all"]) {
      suggestions_lists["all"] = domains_generic;
    }

    let render_list_keys = [];
    let render_lists = {};

    /*
     *
     * Render all except hacks - will mix them in later, if enabled
     *
     */
    for (let listname of suggestions_keys) {
      if (listname === "word hack") continue;
      if (listname === "phrase hack") continue;
      render_list_keys.push(listname);
    }

    /*
     *
     * Filter availabile suggestions
     *
     */
    let all_doms = {};
    for (let listname of render_list_keys) {
      if (!suggestions_lists[listname]) continue;
      // init list
      let list_pp = [];
      let list_p = [];
      let list = [];
      // fill list
      let domStr_added = 0;
      for (let domStr of suggestions_lists[listname]) {
        domStr_added++;
        let domStrNoSpaces = domStr.replace(/ /g, "");
        // unique! if already shown in previous list, don't show in any future list
        if (all_doms[domStrNoSpaces]) continue;
        // prevent duplicate call next time
        if (listname !== "generic" || domStr_added <= 2) {
          all_doms[domStrNoSpaces] = true;
        }
        // show dom in list?
        let code = Number(domain_availability[domStrNoSpaces] || 0);
        if (
          code === 2 ||
          (code === 1 && !!ui.show_unavailable) ||
          !code ||
          domStrNoSpaces === input_str + "." + input_tld ||
          domStrNoSpaces === input_spellchecked + "." + input_tld
          // ||
          // (code === 3 && !!ui.show_premium_registry) ||
          // (code === 4 && !!ui.show_premium_aftermarket)
        ) {
          // ok, add now
          list.push(domStr);
          //
        } else if (code === 3 && !!ui.show_premium_registry) {
          // premium, mix in after
          list_p.push(domStr);
          //
        } else if (code === 4 && !!ui.show_premium_aftermarket) {
          // premium, mix in after
          list_pp.push(domStr);
          //
        }
      }

      /*
       * Shuffle
       */
      // if (listname === "name") {
      list = strings_shuffle_first2(list);
      // }

      /*
       * Mix in premium
       */
      let jitter_arr = [0, 1, -1, 2, 0, -2, 1, -2, 0, 0, -1, 1, 0]; // Math.round((Math.random() - 0.5) * 3)
      let premiums = arrays_mix([list_p, list_pp]);
      let ratio_premium = Math.max(Math.ceil(list.length / premiums.length), 3);
      let loop_i = 0;
      let splice_freq = !!ui.show_premium_registry && !!ui.show_premium_aftermarket ? ratio_premium : ratio_premium + 1;
      let splice_start = 1;
      for (let domStr of premiums) {
        // insert string into list, at regular intervals
        let splice_i = loop_i * splice_freq;
        // add jitter, so it looks more natural
        splice_i += jitter_arr[splice_i % 12];
        // insert
        // if (list.length > splice_i) {
        list.splice(splice_start + splice_i, 0, domStr);
        // } else {
        //   list.push(domStr)
        // }
        loop_i++;
      }

      // save
      render_lists[listname] = list;
    }

    /*
     *
     * Mix in hacks
     *
     */
    if (!ui.show_one_list) {
      let mixin_lists = [];
      if (!!ui.show_word_hacks) {
        mixin_lists.push("word hack");
      }
      if (!!ui.show_phrase_hacks) {
        mixin_lists.push("phrase hack");
      }
      for (let listname of mixin_lists) {
        let startat = listname === "word hack" ? 3 : 1;
        let stagger = listname === "word hack" ? 5 : 3;
        if (suggestions_lists[listname]) {
          for (let si in suggestions_lists[listname]) {
            let domStr = suggestions_lists[listname][si];
            let domStrNoSpaces = domStr.replace(/ /g, "");
            let code = Number(domain_availability[domStrNoSpaces] || 0);
            if (
              code === 2 ||
              (code === 1 && !!ui.show_unavailable) ||
              !code ||
              (code === 3 && !!ui.show_premium_registry) ||
              (code === 4 && !!ui.show_premium_aftermarket)
            ) {
              // ok to use
              render_lists["name"].splice(si * stagger + startat, 0, domStr);
            }
          }
        }
      }
    }

    /*
     *
     * All in one list
     *
     */
    if (!!ui.show_one_list) {
      render_list_keys = ["all"];
      /*
       * Fix "all" list
       * Combine from individual lists, after got availability
       */
      let all_unique = {
        [input_str.replace(/ /g, "") + "." + input_tld]: true,
        [input_spellchecked.replace(/ /g, "") + "." + input_tld]: true,
      };
      let all = [input_str.replace(/ /g, "") + " ." + input_tld];
      if (input_spellchecked.replace(/ /g, "") !== input_str.replace(/ /g, "")) {
        all.push(input_spellchecked + " ." + input_tld);
      }
      let ratios = {
        generic: 1,
        tld: 1,
        com: 3,
        name: 2,
        "phrase hack": 1,
        "word hack": 1,
      };
      for (let ln = 1; ln < 50; ln++) {
        listloop: for (let listname in ratios) {
          if (listname === "all") continue;
          let list = render_lists[listname];
          if (!list) continue;
          let ratio = ratios[listname];
          // from previous (which is current minus one) until current
          // first pass on "tld": from ((prev-1)*ratio) ((1-1)*3 = 0) until less than (current*ratio) (1*3 = 3)
          // secnd pass on "tld": from ((prev-1)*ratio) ((2-1)*3 = 3) until less than (current*ratio) (2*3 = 6)
          for (let li = (ln - 1) * ratio; li < ln * ratio; li++) {
            //
            // add each item in range
            let dom = list[li];
            if (!dom) continue; //break listloop // dont bother looping through all li's - if empty, means there will be no more after
            let dom_ns = dom.replace(/ /g, "");
            if (all_unique[dom_ns]) continue;
            all.push(dom);
            all_unique[dom_ns] = true;
          }
        }
      }
      render_lists["all"] = all;
    }

    /*
     *
     * View
     *
     */
    return (
      <DomsStyled className={"DomsStyled"}>
        <Doms
          OriginalMessage={OriginalMessage}
          domain_availability={domain_availability}
          suggestions_lists={render_lists}
          suggestions_keys={render_list_keys}
          input_tld={input_tld}
          input_str={input_str}
          input_spellchecked={input_spellchecked}
          ui={ui}
          tlds_checked={tlds_checked}
          input_words_arr={input_words_arr}
        />
      </DomsStyled>
    );
  }
}

export default DomsIndex;
