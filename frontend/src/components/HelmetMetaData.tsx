/* eslint-disable react/jsx-props-no-spreading */
import React from "react"
import { Helmet } from "react-helmet"

// code adapted from https://medium.com/camperstribe/react-social-media-integration-with-react-share-and-react-helmet-84d9def6a445
export default function HelmetMetaData(propsObj: {
    quote?: string
    title?: string
    image?: string
    description?: string
    hashtag?: string
    noindex?: boolean
}): JSX.Element {
    const { quote = "" } = propsObj
    const { title = "CMPUT 401 Projects Portal" } = propsObj
    const { image = "/logo512.png" } = propsObj
    const {
        description = "The CMPUT 401 Projects Portal connects Albertan nonprofits and early stage startups that have interesting project ideas with teams of students who can help implement those ideas.",
    } = propsObj
    const { hashtag = "#401portal" } = propsObj
    const { noindex = false } = propsObj

    return (
        <Helmet>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta name="csrf_token" content="" />
            <meta property="type" content="website" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1, shrink-to-fit=no"
            />
            <meta name="msapplication-TileColor" content="#ffffff" />
            <meta name="msapplication-TileImage" content="/logo512.png" />
            <meta name="theme-color" content="#ffffff" />
            <meta name="_token" content="" />
            <meta
                name="robots"
                content={noindex ? `noindex` : `index, follow, noodp`}
            />
            <meta property="title" content={title} />
            <meta property="quote" content={quote} />
            <meta name="description" content={description} />
            <meta property="image" content={image} />
            <meta property="og:locale" content="en_CA" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:quote" content={quote} />
            <meta property="og:hashtag" content={hashtag} />
            <meta property="og:image" content={image} />
            <meta content="image/*" property="og:image:type" />
            <meta property="og:site_name" content="CMPUT 401 Projects Portal" />
            <meta property="og:description" content={description} />{" "}
        </Helmet>
    )
}
