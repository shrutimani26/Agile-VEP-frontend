import React, { useState, useEffect } from 'react';
import { Application, ApplicationStatus } from '../types';
import { useAuth } from '@/Auth/useAuth';
import apiService from '@/api/api.service';
import { Link } from 'react-router-dom';

const PermitQR: React.FC = () => {
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshSeed, setRefreshSeed] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const { user } = useAuth();

  // Load approved application
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get all user's applications
        const apps = await apiService.Application.getAll();

        // Find the first approved application
        const approvedApps = apps.filter(
          (a: Application) => a.status === ApplicationStatus.APPROVED
        );

        console.log('Approved applications:', approvedApps);

        if (approvedApps.length > 0) {
          // Get the most recent approved application
          const latestApproved = approvedApps.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          })[0];

          setApp(latestApproved);
        } else {
          setApp(null);
        }
      } catch (error) {
        console.error('Failed to load application:', error);
        setApp(null);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  // Auto-refresh QR code every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshSeed(Date.now());
    setTimeLeft(30);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const qrToken = app ? `PERMIT-${app.id}-${Math.floor(refreshSeed / 1000)}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(qrToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading your permit...</p>
        </div>
      </div>
    );
  }

  // No approved application found
  if (!app) {
    return (
      <div className="max-w-md mx-auto py-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-12">
          <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No Active Permit</h3>
          <p className="text-slate-500 mb-8">
            You don't have any approved vehicle entry permits yet. Apply for one to access this feature.
          </p>
          <Link
            to="/driver/dashboard"
            className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Check if permit is expired
  const isExpired = app.expiryDate && new Date(app.expiryDate) < new Date();

  return (
    <div className="max-w-md mx-auto py-8 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center">
        <div className={`p-6 ${isExpired ? 'bg-red-600' : 'bg-emerald-600'} text-white`}>
          <h2 className="text-xl font-bold tracking-tight">
            {isExpired ? 'Expired Permit' : 'Digital Border Pass'}
          </h2>
          <p className={`${isExpired ? 'text-red-100' : 'text-emerald-100'} text-xs mt-1 uppercase tracking-widest font-medium opacity-80`}>
            Woodlands / Tuas Checkpoint
          </p>
        </div>

        <div className="p-10 space-y-8">
          {/* QR Code Display */}
          <div className="flex flex-col items-center">
            <div
              className={`p-4 bg-white border-8 border-slate-50 rounded-3xl shadow-inner transition-opacity duration-300 ${isRefreshing ? 'opacity-30' : 'opacity-100'
                } relative ${isExpired ? 'grayscale' : ''}`}
            >
              {/* Mock QR Code Representation */}
              <div className="w-56 h-56 bg-slate-900 rounded-2xl p-4 flex flex-wrap items-start justify-start overflow-hidden opacity-95 relative">
                {Array.from({ length: 400 }).map((_, i) => (
                  <div
                    key={`${i}-${refreshSeed}`}
                    className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-white' : 'bg-slate-900'}`}
                  />
                ))}
                {/* Simulated center square */}
                <div
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 ${isExpired ? 'bg-red-500' : 'bg-emerald-500'
                    } rounded-xl border-4 border-white flex items-center justify-center shadow-lg`}
                >
                  {isExpired ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Refresh Timer */}
            {!isExpired && (
              <div className="mt-6 w-full max-w-[200px]">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  <span>Security Token</span>
                  <span className="text-emerald-600">Rotating in {timeLeft}s</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Permit Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl text-left">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Vehicle Plate</p>
              <p className="text-lg font-black text-slate-900">
                {app.vehicle?.plateNo || 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-left">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Valid Thru</p>
              <p className={`text-lg font-black ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>
                {app.expiryDate ? new Date(app.expiryDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Vehicle Details */}
          {app.vehicle && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl text-left">
                <p className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">Make</p>
                <p className="text-sm font-bold text-slate-700">{app.vehicle.make}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-left">
                <p className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">Model</p>
                <p className="text-sm font-bold text-slate-700">{app.vehicle.model}</p>
              </div>
            </div>
          )}

          {/* Expired Warning */}
          {isExpired && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-bold text-red-600">
                ⚠️ This permit has expired. Please renew your application.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-slate-50 border-t flex flex-col gap-3">
          {!isExpired && (
            <div className="relative group">
              <button
                onClick={handleCopy}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-mono text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    COPIED
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    {qrToken.slice(0, 20)}...
                  </>
                )}
              </button>
            </div>
          )}

          <Link
            to="/driver/dashboard"
            className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors text-center"
          >
            {isExpired ? 'Back to Dashboard' : 'Close Pass'}
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-[10px] text-slate-400 leading-relaxed px-8 font-medium uppercase tracking-widest">
        {isExpired
          ? 'This permit has expired. Please submit a new application.'
          : 'This QR code is encrypted and valid only for 30 seconds. Do not share screen captures.'}
      </p>
    </div>
  );
};

export default PermitQR;
