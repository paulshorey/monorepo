import * as thirdparty from "src/shared/redux/actions/api/thirdparty"
import * as domain from "src/shared/redux/actions/api/data_domain"
import * as word from "src/shared/redux/actions/api/data_word"

export default { ...thirdparty, ...domain, ...word }
