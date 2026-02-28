
import React, { useState, useEffect } from 'react';
import { User, Application, ApplicationStatus, Vehicle } from '../types';
import { useAuth } from '@/Auth/useAuth';
import apiService from '@/api/api.service';
import { Link } from 'react-router';

interface DashboardProps {
  onAction: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAction }) => {
  const [apps, setApps] = useState<Application[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    console.log("Loading dashboard data for user:", user);
    const loadData = async () => {
      const [userApps, userVehicles] = await Promise.all([
        apiService.Application.getAll(),
        apiService.Vehicle.getAll(),
      ]);
      setApps(userApps);
      setVehicles(userVehicles);
      setLoading(false);
    };
    loadData();

  }, [user?.id]);

  const stats = [
    { label: 'Active Permits', value: apps.filter(a => a.status === ApplicationStatus.APPROVED).length, color: 'emerald' },
    { label: 'Pending', value: apps.filter(a => a.status === ApplicationStatus.PENDING_REVIEW || a.status === ApplicationStatus.SUBMITTED).length, color: 'amber' },
    { label: 'Vehicles', value: vehicles.length, color: 'blue' },
  ];

  const expiringVehicles = vehicles.filter(v => {
    const expiry = new Date(v.insuranceExpiry);
    const now = new Date();
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diff < 30; // 30 days
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Stats */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map(stat => (
            <div key={stat.label} className={`p-4 rounded-xl border-2 border-${stat.color}-100 bg-${stat.color}-50`}>
              <p className={`text-${stat.color}-700 text-sm font-semibold uppercase tracking-wider`}>{stat.label}</p>
              <p className={`text-3xl font-bold text-${stat.color}-900`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Application Status */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold">Current Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Vehicle</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Submitted At</th>
                <th className="px-6 py-4 font-semibold">Valid Until</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apps.map(app => {
                const vehicle = vehicles.find(v => v.id === app.vehicleId);
                return (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{vehicle?.plateNo || 'N/A'}</p>
                      <p className="text-xs text-slate-500">{vehicle?.make} {vehicle?.model}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${app.status === ApplicationStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' :
                        app.status === ApplicationStatus.REJECTED ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {app.expiryDate ? new Date(app.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No current applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
