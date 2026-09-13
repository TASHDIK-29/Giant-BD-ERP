'use client';

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { AuthProvider, useAuth } from '@/features/auth/auth-provider';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

// function DashboardContent({
//     children,
// }: Readonly<{
//     children: React.ReactNode;
// }>) {
//     const { isLoading, isAuthenticated } = useAuth();

//     if (isLoading) {
//         return (
//             <div className="flex min-h-screen items-center justify-center">
//                 <div className="text-sm text-muted-foreground">
//                     Checking authentication...
//                 </div>
//             </div>
//         );
//     }

//     if (!isAuthenticated) {
//         return null;
//     }

//     return (
//         <div className="min-h-screen bg-muted/30">
//             <DashboardSidebar />

//             <div className="pl-72">
//                 <main className="min-h-screen p-6">
//                     {children}
//                 </main>
//             </div>
//         </div>
//     );
// }

// export default function DashboardLayout({
//     children,
// }: Readonly<{
//     children: React.ReactNode;
// }>) {
//     return (
//         <AuthProvider>
//             <DashboardContent>
//                 {children}
//             </DashboardContent>
//         </AuthProvider>
//     );
// }





export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthProvider>
            <DashboardShell>
                {children}
            </DashboardShell>
        </AuthProvider>
    );
}