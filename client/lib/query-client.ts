// 'use client';

// import { QueryClient } from '@tanstack/react-query';
// import { useState } from 'react';

// export function useQueryClientInstance() {
//   const [queryClient] = useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             staleTime: 60 * 1000,
//             refetchOnWindowFocus: false,
//           },
//         },
//       }),
//   );

//   return queryClient;
// }