
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

      {/* Alerts */}
      {(expiringVehicles.length > 0 || apps.some(a => a.status === ApplicationStatus.REJECTED)) && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center">
            <svg className="w-5 h-5 mr-2 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Urgent Attention
          </h3>
          {expiringVehicles.map(v => (
            <div key={v.id} className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-rose-900">Insurance Expiring Soon</p>
                <p className="text-sm text-rose-700">{v.plateNo} ({v.make} {v.model}) expires on {v.insuranceExpiry}</p>
              </div>
              <button className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700">Update Now</button>
            </div>
          ))}
          {apps.filter(a => a.status === ApplicationStatus.REJECTED).map(a => (
            <div key={a.id} className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-rose-900">Application Rejected</p>
                <p className="text-sm text-rose-700">Reason: {a.decisionReason || 'Missing documentation'}</p>
              </div>
              <button onClick={() => onAction('new-app')} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700">Fix & Resubmit</button>
            </div>
          ))}
        </section>
      )}

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-600 p-8 rounded-2xl shadow-lg text-white">
          <h3 className="text-xl font-bold mb-2">Crossing Soon?</h3>
          <p className="text-emerald-100 mb-6">Generate your digital permit QR code for instant checkpoint verification.</p>
          <Link to="/driver/permit"
            disabled={!apps.some(a => a.status === ApplicationStatus.APPROVED)}
            onClick={() => onAction('qr-permit')}
            className="w-full p-3 bg-white text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Permit QR
          </Link>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold mb-2 text-slate-900">New Permit</h3>
          <p className="text-slate-500 mb-6">Register a new vehicle or apply for a fresh VEP entry permit.</p>
          <Link to="/driver/new-application"
            onClick={() => onAction('new-app')}
            className="w-full p-3 border-2 border-emerald-600 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
          >
            Start New Application
          </Link>
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
