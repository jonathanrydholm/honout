const Root = ({ children }) => {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                />
                <meta httpEquiv="cache-control" content="max-age=0" />
                <meta httpEquiv="cache-control" content="no-cache" />
                <meta httpEquiv="expires" content="0" />
                <meta
                    httpEquiv="expires"
                    content="Tue, 01 Jan 1980 1:00:00 GMT"
                />
                <meta httpEquiv="pragma" content="no-cache" />
                <title>Some title</title>
            </head>
            <body>{children}</body>
        </html>
    );
};

export default Root;
