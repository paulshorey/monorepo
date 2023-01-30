import { useRouter } from "next/router";
import App from "src/shared/components/Layout";
import Results from "src/domains/containers/Results";

const SuggestionsResults = () => {
  const router = useRouter();
  const options = router.query.options?.split("/") || [];
  return (
    <App>
      <Results str={options[0]} tld={options[1]} />
    </App>
  );
};

export default SuggestionsResults;
