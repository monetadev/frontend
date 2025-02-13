
module.exports = {
    client: {
      service: {
        name: 'my-app',
        // URL to the GraphQL API (set to your API URL when you're ready)
        url: 'http://localhost:3000/graphql',  // Replace with your API URL
      },
      includes: [
        'src/**/*.vue',  // The paths of files to be processed by the extension
        'src/**/*.js',
      ],
    },
  };
  