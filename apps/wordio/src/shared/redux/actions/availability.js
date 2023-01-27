import { v1_domain_availability } from "src/shared/http/v1";
// import * as io_actions from "src/shared/redux/actions/io"
// const sleep = function (ms = 0) {
//   return new Promise((r) => setTimeout(r, ms));
// };
const DEBUG1 = false;

export function RX__domain_availability() {
  return async (dispatch, getState) => {
    /*
     * Incremental lists of domains to check (from domain_availability_queue dict)
     */
    let { input, output } = getState();
    let { domain_availability_queue, domain_availability_queue_sent, domain_availability } = output;
    // console.log("domain_availability_queue", domain_availability_queue);
    let check_doms = [];
    for (let dom in domain_availability_queue) {
      if (
        domain_availability &&
        !(dom in domain_availability) &&
        domain_availability_queue_sent &&
        !(dom in domain_availability_queue_sent)
      ) {
        check_doms.push(dom);
      }
    }
    dispatch({
      type: "RX__availability_queue_clear"
    });
    dispatch({
      type: "RX__domains_add_to_availability_queue_sent",
      data: check_doms
    });

    /*`
     * Make flat list of domain names to POST
     */
    let suggestions = check_doms;

    /*
     * Fix domains
     */
    // unique
    suggestions = [...new Set(suggestions)];
    suggestions = suggestions.filter((str) => !domain_availability[str]); // only if not already checked
    suggestions = suggestions.map((str) => str.replace(/ /g, ""));
    /*
     * Fetch availability of each suggestion string
     * (50 at a time)
     */
    if (suggestions.length) {
      // let suggestions_slice = suggestions
      // suggestions = suggestions.slice(0,100) // debug limited list
      let n_page = 100; //Math.max(60, Math.ceil(suggestions.length / 6)) // browser allows 6 concurrent connections
      for (let i_page = 0; i_page * n_page < suggestions.length; i_page++) {
        if (DEBUG1) console.warn("for", i_page, i_page * n_page, suggestions.length);
        setTimeout(
          function () {
            if (DEBUG1) console.log("check availability", this.i_page, this.i_page * this.n_page, suggestions.length);
            let start = this.i_page * this.n_page;
            let end = this.i_page * this.n_page + this.n_page;
            let suggestions_slice = suggestions.slice(start, end);
            if (suggestions_slice.length) {
              let params = {
                options: {},
                domains: suggestions_slice,
                recaptcha2_token: input.captcha2,
                recaptcha3_token: input.captcha3
              };
              // if (DEBUG1) console.log("send                        v1_domain_availability")
              // console.timeEnd("/ds")
              // console.time("/ds")

              if (DEBUG1) console.log("sending v1_domain_availability()");
              // console.log(params.domains);
              v1_domain_availability(params).then((data = {}) => {
                if (data.status) {
                  if (DEBUG1) console.warn("received v1_domain_availability( alt= true )", data);
                  // save
                  dispatch({
                    type: "RX__domain_availability",
                    data: data.status
                  });
                  /*
                   * IF USE_CLI, AND NOT FOUND, TRY AGAIN
                   * run same API endpoint again, but this time without CLI PING
                   */
                  // let try_again_arr = []
                  // // look at all INPUT dict
                  // for (let domname of suggestions_slice) {
                  //   // see if it exists in the OUTPUT dict
                  //   if (
                  //     !data.status[domname] ||
                  //     (data.status[domname].length && !data.status[domname][0])
                  //   ) {
                  //     // missing! try again!
                  //     try_again_arr.push(domname)
                  //   }
                  // }
                  // if (try_again_arr.length) {
                  //   params.domains = try_again_arr // check only the missing ones
                  // }
                }
              });
              //
              //       // setTimeout(() => {
              //       //   if (DEBUG1) console.warn("sending v1_domain_availability( 2ND TRY )")
              //       //   params.options.use_alt_source = this.i_page === 0 ? false : true
              //       //   v1_domain_availability(params).then((data) => {
              //       //     if (data && typeof data === "object" && "availability" in data) {
              //       //       if (DEBUG1) console.warn("received v1_domain_availability( alt= false )", data)
              //       //       // save
              //       //       dispatch({
              //       //         type: "RX__domain_availability",
              //       //         data: data.status
              //       //       })
              //       //     }
              //       //   })
              //       // }, 1000)
            }
          }.bind({ i_page, n_page }),
          i_page * 4000
        );
      }
    }
  };
}
