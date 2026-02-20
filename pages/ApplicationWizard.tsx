
import React, { useState, useEffect } from 'react';
import { ApplicationStatus, Application, Vehicle } from '../types';
import apiService from '@/api/api.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/Auth/useAuth';

const ApplicationWizard: React.FC = () => {
  const navigate = useNavigate();
  const onCancel = () => {
    navigate('/driver/dashboard');
  };
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    paymentMethod: 'saved',
  });

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setVehiclesLoading(true);
        setVehiclesError(null);
        const data = await apiService.Vehicle.getAll();
        setVehicles(data);
        if (data.length > 0) {
          setSelectedVehicle(data[0]);
        }
      } catch (err: any) {
        console.error('Failed to load vehicles:', err);
        setVehiclesError('Failed to load vehicles. Please try again.');
      } finally {
        setVehiclesLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    try {
      if (!selectedVehicle) {
        alert('Please select a vehicle');
        return;
      }

      // 1. Create Application with selected vehicle
      const draftApplication = await apiService.Application.create(selectedVehicle.id);
      console.log("Draft application created:", draftApplication);
      
      // 2. Submit Application
      const newApplication = await apiService.Application.submit(draftApplication.application.id);
      console.log("Application submitted:", newApplication);
      
      alert("Application submitted successfully!");
      navigate('/driver/dashboard');
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      alert(err.response?.data?.error || 'Failed to submit application. Please try again.');
    }
  };

  const steps = [
    { num: 1, title: 'Vehicle Info' },
    { num: 2, title: 'Upload Documents' },
    { num: 3, title: 'Payment & Review' },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
          {steps.map(s => (
            <div key={s.num} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 ${step >= s.num ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}>
                {s.num}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold mt-2 ${step >= s.num ? 'text-emerald-700' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-slate-900">Select Vehicle</h2>
              <p className="text-slate-500">Choose a registered vehicle to start your permit application.</p>

              {vehiclesError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {vehiclesError}
                </div>
              )}

              {vehiclesLoading ? (
                <div className="p-8 text-center text-slate-500">Loading vehicles...</div>
              ) : vehicles.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-600 mb-4">No vehicles registered yet.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/driver/vehicles')}
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    Add a vehicle first
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Vehicle Dropdown */}
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Choose Vehicle</label>
                    <select
                      value={selectedVehicle?.id?.toString() || ''}
                      onChange={(e) => {
                        const vehicle = vehicles.find(v => v.id?.toString() === e.target.value);
                        setSelectedVehicle(vehicle || null);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id?.toString()}>
                          {v.plateNo} - {v.make} {v.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Details */}
                  {selectedVehicle && (
                    <div className="md:col-span-2 bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                      <div className="flex items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-2xl font-bold text-slate-900">{selectedVehicle.plateNo}</h3>
                          <p className="text-slate-600">{selectedVehicle.make} {selectedVehicle.model}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Year</p>
                          <p className="text-sm font-semibold text-slate-900">{selectedVehicle.year}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Make</p>
                          <p className="text-sm font-semibold text-slate-900">{selectedVehicle.make}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Model</p>
                          <p className="text-sm font-semibold text-slate-900">{selectedVehicle.model}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">VIN</p>
                          <p className="text-sm font-mono text-slate-900">{selectedVehicle.vin}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Insurance Expiry</p>
                          <p className={`text-sm font-semibold ${new Date(selectedVehicle.insuranceExpiry) < new Date() ? 'text-red-600' : 'text-emerald-600'}`}>
                            {new Date(selectedVehicle.insuranceExpiry).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Upload Documents</h2>
              <p className="text-slate-500">Clear scans or photos are required for verification.</p>

              <div className="space-y-4">
                {['Log Card', 'Insurance Proof', 'Passport / ID'].map(doc => (
                  <div key={doc} className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-between hover:border-emerald-300 transition-colors cursor-pointer group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="font-bold text-slate-700">{doc}</p>
                        <p className="text-xs text-slate-400">PDF, JPG, or PNG (Max 10MB)</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">Upload</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Review & Payment</h2>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Permit Fee</span>
                  <span className="font-bold text-slate-900">S$ 5.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Service Fee</span>
                  <span className="font-bold text-slate-900">S$ 0.50</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total Payable</span>
                  <span className="text-xl font-extrabold text-emerald-600">S$ 5.50</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-700">Select Payment Method</p>
                <div className="p-4 border-2 border-emerald-600 bg-emerald-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-[8px] text-white font-bold mr-3">VISA</div>
                    <span className="font-medium text-slate-900">•••• 4432 (Saved)</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-4 border-emerald-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  </div>
                </div>
                <button className="text-sm text-emerald-600 font-bold flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add new payment method
                </button>
              </div>

              <div className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded border-slate-300" defaultChecked />
                <p className="text-xs text-slate-500 leading-relaxed">
                  I hereby declare that the information provided is true and correct. I understand that any false declarations may lead to permit revocation and legal action under Singapore law.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t flex items-center justify-between">
          <button
            onClick={step === 1 ? onCancel : prevStep}
            className="px-6 py-3 text-slate-600 font-bold hover:underline"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={step === 3 ? handleSubmit : nextStep}
            className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700"
          >
            {step === 3 ? 'Confirm & Pay' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationWizard;
