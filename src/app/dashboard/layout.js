'use client';

import { ProtectedRoute } from '@/components/protected-route';
import DashboardLayout from '@/components/dashboard-layout';

export default function DashboardPage({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}