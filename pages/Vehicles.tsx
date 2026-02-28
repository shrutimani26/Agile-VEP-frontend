
import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import apiService from '../api/api.service';
import AddVehicleModal from '../components/AddVehicleModal';

interface Props { 
  onAction: (tab: string) => void;
}

const Vehicles: React.FC<Props> = ({ onAction }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.Vehicle.getAll();
      setVehicles(data);
    } catch (err: any) {
      console.error('Failed to load vehicles:', err);
      setError('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading vehicles...</div>;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">My Vehicles</h2>
          <p className="text-slate-500">Manage Malaysian-registered vehicles linked to your profile.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Vehicle
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase">ACTIVE</span>
            </div>
            
            <div className="flex items-start mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
              </div>
              <div className="ml-6">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{v.plateNo}</h3>
                <p className="text-slate-500 font-medium">{v.make} {v.model} ({v.year})</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Insurance Expiry</span>
                <span className={`text-sm font-black ${new Date(v.insuranceExpiry) < new Date() ? 'text-rose-600' : 'text-slate-900'}`}>
                  {new Date(v.insuranceExpiry).toLocaleDateString()}
                </span>
              </div>
              {/* <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">VIN / Chassis</span>
                <span className="text-sm font-mono text-slate-900">{v.vin}</span>
              </div> */}
            </div>
<div className="mt-8 flex gap-3">
              <button 
                onClick={() => onAction('new-app')}
                className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
              >
                Generate QR
              </button>
            </div>
            <div className="mt-8 flex gap-3">
              <button className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">Edit Details</button>
              <button 
                onClick={() => onAction('new-app')}
                className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
              >
                Renew Permit
              </button>
            </div>
          </div>
        ))}
        {vehicles.length === 0 && (
          <div className="md:col-span-2 py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
             <p className="text-slate-400">No vehicles registered yet.</p>
             <button 
               onClick={() => onAction('new-app')}
               className="mt-4 text-emerald-600 font-bold hover:underline"
             >
               Add your first vehicle
             </button>
          </div>
        )}
      </div>

      <AddVehicleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVehicleAdded={loadVehicles}
      />
    </div>
  );
};

export default Vehicles;
