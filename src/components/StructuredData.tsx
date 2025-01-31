import React from 'react';
import { Helmet } from 'react-helmet';

const StructuredData: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Chat Yatri | Powered by Yatri Cloud",
    "url": "https://chat.yatricloud.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://chat.yatricloud.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
