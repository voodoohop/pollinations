import React from 'react';
import Markdown from 'markdown-to-jsx';

const MarkDownContent = ({ url }) => {
  const [content, setContent] = React.useState('');

  React.useEffect(() => {
    fetch(url)
      .then(response => response.text())
      .then(text => setContent(text));
  }, [url]);

  return (
    <div className="prose">
      <Markdown>{content}</Markdown>
    </div>
  );
};

export default MarkDownContent;
