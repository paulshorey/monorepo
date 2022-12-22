// Not yet used

// import { createClient } from 'contentful-management';

// const client = createClient({
//   accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_API_KEY,
// });

// client
//   .getSpace(process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID)
//   .then((space) => space.getEnvironment(process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID))
//   .then((environment) => environment.getEntry('<entry_id>'))
//   .then((entry) =>
//     entry.patch([
//       {
//         op: 'replace',
//         path: '/fields/title/en-US',
//         value: 'New entry title',
//       },
//     ])
//   )
//   .then((entry) => console.log(`Entry ${entry.sys.id} updated.`))
//   .catch(console.error);
