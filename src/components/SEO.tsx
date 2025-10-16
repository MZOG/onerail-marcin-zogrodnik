import { Helmet } from "react-helmet-async";
import React from "react";

interface SEOProps {
  title: string;
  description?: string;
}

const SEO = ({ title, description }: SEOProps) => {
  const fullTitle = `${title} | OneRail`;
  const defaultDescription = `${
    description || "OneRail Recruitment Task by Marcin Zogrodnik"
  } `;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={defaultDescription} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={defaultDescription} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default SEO;
