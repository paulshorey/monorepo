const TextareaP = function ({ initialValue }) {
  return (
    <p>
      <textarea className="ps-textarea" placeholder="Type here...">
        {initialValue}
      </textarea>
    </p>
  );
};
export default TextareaP;
