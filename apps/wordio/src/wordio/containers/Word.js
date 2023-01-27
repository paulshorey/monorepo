import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as ui_actions from "src/shared/redux/actions/ui";
import api_actions from "src/shared/redux/actions/api";
import * as io_actions from "src/shared/redux/actions/io";
import WordHome from "./WordHome";
import WordResults from "./WordResults";

const Word = (props) => (props.word_input ? <WordResults {...props} /> : <WordHome {...props} />);

const mapDispatchToProps = (dispatch) => {
  return {
    ui_actions: bindActionCreators(ui_actions, dispatch),
    api_actions: bindActionCreators(api_actions, dispatch),
    io_actions: bindActionCreators(io_actions, dispatch),
  };
};

const mapStateToProps = function (state) {
  return {
    ui: state.ui,
    word_input: state.input.str,
    word_chunks: state.output.chunks,
    search_now: state.input.search_now,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Word);
