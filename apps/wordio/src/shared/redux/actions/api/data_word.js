import { RX__search_thesaurus } from "src/shared/redux/actions/io";
import { message } from "antd";
import axios from "axios";

const NEXT_PUBLIC_DEV_ADMIN_API_HOST = "//" + process.env.NEXT_PUBLIC_DEV_ADMIN_API_HOST;

export function data_word_edit(row) {
  console.log("attempting to edit word row: ", row);
  return (dispatch) => {
    // save
    if (typeof window === "object" && window.isLoading) window.isLoading("word");
    return axios({
      method: "put",
      url: NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/data/word/" + row.key,
      data: row
    })
      .then(() => {
        message.success(`edited word "${row.key}"`);
        // update word
        dispatch(RX__search_thesaurus({ force: true }));
      })
      .catch((err) => {
        console.error(err);
        message.error(`could not edit key=${row.key}`, 10);
      })
      .then(() => {
        if (typeof window === "object" && window.doneLoading) window.doneLoading("word");
      });
  };
}
export function data_word_delete(key) {
  console.error("attempting to delete word row: ", key);
  return (dispatch) => {
    // save
    if (typeof window === "object" && window.isLoading) window.isLoading("word");
    return axios({
      method: "delete",
      url: NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/data/word/" + key
    })
      .then(() => {
        message.success(`edited word "${key}"`);
        // update word
        dispatch(RX__search_thesaurus({ force: true }));
      })
      .catch((err) => {
        console.error(err);
        message.error(`could not edit key=${key}`, 10);
      })
      .then(() => {
        if (typeof window === "object" && window.doneLoading) window.doneLoading("word");
      });
  };
}

export function data_word_sentiment_of_synonym(key, synonym, sentiment) {
  return (dispatch) => {
    // save
    return axios({
      method: "put",
      url: NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/data/word_sentiment_of_synonym",
      data: { key, synonym, sentiment }
    })
      .then(() => {
        message.success(`edited synonym="${synonym}" sentiment="${sentiment}"`);
        // update word
        dispatch(RX__search_thesaurus({ force: true }));
      })
      .catch((err) => {
        console.error(err);
        message.error(`could not edit key=${key}`, 10);
      });
  };
}

export function data_word_proper_of_synonym(key, synonym, proper) {
  return (dispatch) => {
    // save
    return axios({
      method: "put",
      url: NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/data/word_proper_of_synonym/" + key + "/" + synonym,
      data: { proper }
    })
      .then(() => {
        message.success(`edited synonym="${synonym}" proper="${proper}"`);
        // update word
        dispatch(RX__search_thesaurus({ force: true }));
      })
      .catch((err) => {
        console.error(err);
        message.error(`could not edit key=${key}`, 10);
      });
  };
}

export function data_word_add_poswords(key, pos, poswords) {
  return (dispatch) => {
    // prep
    let poslist = poswords.split(",").map((w) => w.trim());
    if (poslist && poslist.length) {
      // save
      return axios({
        method: "put",
        url: NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/data/word_add_poswords",
        data: { key, pos, poswords: poslist }
      })
        .then(() => {
          message.success(`added poswords="${poswords}" to pos="${pos}"`);
          // welcome, welcome home, homecoming, finally, regards, salutations, missed you,
          // update word
          dispatch(RX__search_thesaurus({ force: true }));
        })
        .catch((err) => {
          console.error(err);
          message.error(`could not save key=${key}, pos=${pos}, poswords=${poswords}`, 10);
        });
    }
  };
}

export function data_word_remove_words(key, wordsString) {
  return (dispatch) => {
    // prep
    let wordsList = wordsString.split(",").map((w) => w.trim());
    if (wordsList && wordsList.length) {
      // save
      return axios({
        method: "put",
        url: NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/data/word_remove_words",
        data: { key, words: wordsList }
      })
        .then(() => {
          message.success(`removed poswords="${wordsString}" from key="${key}"`);
          // update word
          dispatch(RX__search_thesaurus({ force: true }));
        })
        .catch((err) => {
          console.error(err);
          message.error(`could not save key=${key}, words=${wordsString}`, 10);
        });
    }
  };
}

// export function data_word_remove_synonym(key, synonym) {
//   return (dispatch) => {
//     // save
//     return axios({
//       method: "put",
//       url: NEXT_PUBLIC_DEV_ADMIN_API_HOST + "/data/word_remove_synonym/" + key + "/" + synonym,
//       data: {}
//     })
//       .then(() => {
//         message.success(`removed synonym="${synonym}" from key="${key}"`);
//         // update word
//         dispatch(RX__search_thesaurus({ force: true }));
//       })
//       .catch((err) => {
//         console.error(err);
//         message.error(`could not remove synonym="${synonym}" from key="${key}"`, 10);
//       });
//   };
// }

// export function data_word_add_to_others({ addWord, pos, addToOthers }) {
//   window.isLoading('add_to_others')
//   return async (dispatch) => {
//     // save
//     return axios({
//       'method': 'put',
//       'url': NEXT_PUBLIC_DEV_ADMIN_API_HOST + '/data/word_add_to_others',
//       'data': { addWord, pos, addToOthers },
//     })
//       .then(() => {
//         message.success(`removed synonym="${synonym}" from key="${key}"`)
//         // update word
// //         dispatch(RX__search_thesaurus({force:true}))
//       })
//       .catch((err) => {
//         console.error(err)
//         message.error(`could not remove synonym="${synonym}" from key="${key}"`, 10)
//       })
//       .then(() => {
//         window.doneLoading('add_to_others')
//       })
//   }
// }
