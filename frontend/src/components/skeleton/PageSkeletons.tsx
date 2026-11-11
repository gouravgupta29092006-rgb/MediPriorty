import React from 'react';
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonChart } from './Skeleton';

// 1. Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading Dashboard">
    {/* Page Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-56 h-7" />
        <Skeleton className="w-80 h-4" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="w-24 h-9 rounded-lg" />
        <Skeleton className="w-36 h-9 rounded-lg" />
      </div>
    </div>

    {/* 4 KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>

    {/* Main Grid: Triage Distribution + Live Heap Queue Preview */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-20 h-4" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/60">
              <div className="flex items-center gap-2.5">
                <Skeleton variant="circle" className="w-3 h-3" />
                <Skeleton className="w-28 h-4" />
              </div>
              <Skeleton className="w-8 h-5 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 bg-bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-40 h-5" />
            <Skeleton className="w-20 h-4 rounded-full" />
          </div>
          <Skeleton className="w-20 h-4" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-lg border border-border/80">
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" className="w-7 h-7" />
                <div className="space-y-1.5">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-5 rounded" />
                <Skeleton className="w-16 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// 2. Priority Queue Skeleton
export const PriorityQueueSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading Priority Queue">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-64 h-7" />
        <Skeleton className="w-96 h-4" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="w-24 h-9 rounded-lg" />
        <Skeleton className="w-32 h-9 rounded-lg" />
      </div>
    </div>

    {/* Explainer Banner */}
    <div className="bg-bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
      <Skeleton variant="circle" className="w-8 h-8 shrink-0" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="w-48 h-4" />
        <Skeleton className="w-full max-w-2xl h-3" />
      </div>
    </div>

    {/* Ordered Queue Cards */}
    <div className="bg-bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Skeleton className="w-44 h-5" />
        <Skeleton className="w-28 h-4" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="w-40 h-4" />
                <Skeleton className="w-28 h-3" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="w-20 h-6 rounded-md" />
              <Skeleton className="w-24 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 3. Emergency Requests Skeleton
export const EmergencyRequestsSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading Emergency Requests">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-56 h-7" />
        <Skeleton className="w-72 h-4" />
      </div>
      <Skeleton className="w-40 h-9 rounded-lg" />
    </div>

    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex gap-2">
        <Skeleton className="w-20 h-8 rounded-lg" />
        <Skeleton className="w-20 h-8 rounded-lg" />
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
      <Skeleton className="w-64 h-8 rounded-lg" />
    </div>

    <SkeletonTable rows={6} columns={6} />
  </div>
);

// 4. Clinical Triage Skeleton
export const TriageSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading Triage Management">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-60 h-7" />
        <Skeleton className="w-80 h-4" />
      </div>
    </div>

    {/* 4 Triage Category Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-bg-surface border border-border rounded-xl p-5 space-y-3">
          <Skeleton className="w-24 h-5 rounded-md" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-16 h-3" />
        </div>
      ))}
    </div>

    {/* Patient Assessment Form */}
    <div className="bg-bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
      <Skeleton className="w-48 h-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
      </div>
      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="w-36 h-10 rounded-lg" />
    </div>
  </div>
);

// 5. Ambulances & Dispatch Skeleton
export const AmbulancesSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading Ambulances">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-64 h-7" />
        <Skeleton className="w-96 h-4" />
      </div>
      <Skeleton className="w-28 h-9 rounded-lg" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
        <Skeleton className="w-48 h-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
        <Skeleton className="w-full h-10 rounded-lg" />
      </div>
      <div className="bg-bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
        <Skeleton className="w-40 h-5" />
        <Skeleton className="w-full h-8" />
        <Skeleton className="w-full h-10 rounded-lg" />
      </div>
    </div>

    <SkeletonTable rows={6} columns={6} />
  </div>
);

// 6. Beds & Admissions Skeleton
export const BedsSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading Beds">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-60 h-7" />
        <Skeleton className="w-80 h-4" />
      </div>
      <Skeleton className="w-36 h-9 rounded-lg" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-bg-surface border border-border rounded-xl p-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
          <Skeleton className="w-28 h-3" />
          <Skeleton className="w-full h-8 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

// 7. Patients Directory Skeleton
export const PatientsSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading Patients Directory">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-56 h-7" />
        <Skeleton className="w-72 h-4" />
      </div>
      <Skeleton className="w-36 h-9 rounded-lg" />
    </div>

    <div className="flex items-center justify-between gap-4">
      <Skeleton className="w-72 h-9 rounded-lg" />
      <Skeleton className="w-28 h-9 rounded-lg" />
    </div>

    <SkeletonTable rows={7} columns={5} />
  </div>
);

// 8. Allocation History Skeleton
export const AllocationsSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading Allocation History">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-64 h-7" />
        <Skeleton className="w-80 h-4" />
      </div>
      <Skeleton className="w-28 h-9 rounded-lg" />
    </div>

    <div className="flex gap-2">
      <Skeleton className="w-32 h-9 rounded-lg" />
      <Skeleton className="w-32 h-9 rounded-lg" />
    </div>

    <SkeletonTable rows={6} columns={6} />
  </div>
);

// 9. Analytics & KPIs Skeleton
export const AnalyticsSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading Analytics">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-64 h-7" />
        <Skeleton className="w-80 h-4" />
      </div>
      <Skeleton className="w-28 h-9 rounded-lg" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonChart type="doughnut" className="h-80" />
      <SkeletonChart type="doughnut" className="h-80" />
    </div>

    <SkeletonChart type="bar" className="h-80" />
  </div>
);

// 10. User Management Skeleton
export const UsersSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading Users">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-56 h-7" />
        <Skeleton className="w-72 h-4" />
      </div>
      <Skeleton className="w-32 h-9 rounded-lg" />
    </div>

    <SkeletonTable rows={5} columns={5} />
  </div>
);

// 11. Audit Logs Skeleton
export const AuditLogsSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading Audit Logs">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="w-56 h-7" />
        <Skeleton className="w-80 h-4" />
      </div>
      <Skeleton className="w-28 h-9 rounded-lg" />
    </div>

    <SkeletonTable rows={8} columns={5} />
  </div>
);

