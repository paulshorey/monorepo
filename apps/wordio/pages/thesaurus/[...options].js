import { useRouter } from "next/router";
import App from "src/shared/components/Layout";
import WordResults from "src/wordio/containers/WordResults";

const ThesaurusResults = () => {
  const router = useRouter();
  const options = router.query.options?.split("/") || [];
  return (
    <App>
      <WordResults str={options[0]} />
    </App>
  );
};

export default ThesaurusResults;
