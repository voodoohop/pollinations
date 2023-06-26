import React from "react";
import { Helmet } from "react-helmet";
import removeMarkdown from "markdown-to-text";
import Debug from "debug";
import SITE_METADATA from "../siteMetadata";

const debug = Debug("Helmet");

const DESCRIPTION = 'Pollinations is a platform to generate media with the help of AI. Here you can create customized, royalty-free pieces of audio, images, 3D objects and soon fully immersive 3D environments on the fly.';


export const SEOMetadata= ({ description, url }) => {
    const title = SITE_METADATA.title;

    // não é a coisa mais bonita do mundo mas é o que temos de melhor
    url = url ? url : window.location.href;
    description = description ? removeMarkdown(description) : DESCRIPTION;

    return  <Helmet>
                <title children={title} />
                <meta property="og:title" content={title} />
                <meta property="og:type" content="website" />
                <meta property="twitter:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:description" content={description} />
                <meta name="description" content={description} />
                <meta property="twitter:creator" content="pollinations_ai" />
                <meta property="twitter:description" content={description} />
                <meta property="og:url" content={url} />                
            </Helmet>;
}

export const SEO = () => {

    return <>
        <SEOMetadata title={SITE_METADATA.title} description={description} url={`https://${SITE_METADATA.domain}}`}/>
    </>;  
}