import React, { useState } from 'react';
import apiService from '@/api/api.service';
import { useNavigate } from 'react-router-dom';

const ApplicationWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vehicleData, setVehicleData] = useState({
    plateNo: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    insuranceExpiry: '',
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const validateVehicleStep = () => {
    if (!vehicleData.plateNo || !vehicleData.make || !vehicleData.model || !vehicleData.vin || !vehicleData.insuranceExpiry) {
      setError('Please fill in all fields before proceeding.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateVehicleStep()) return;
    nextStep();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // 1. Create vehicle + application in one call
      const result = await apiService.Application.create({
        plate_no: vehicleData.plateNo,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        vin: vehicleData.vin,
        insurance_expiry: vehicleData.insuranceExpiry,
      });

      console.log('Application created:', result);

      // 2. Submit the application
      const submitted = await apiService.Application.submit(result.application.id);
      console.log('Application submitted:', submitted);

      alert('Application submitted successfully!');
      navigate('/driver/vehicles');
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 ${
                step >= s.num ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-400'
              }`}>
                {s.num}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold mt-2 ${
                step >= s.num ? 'text-emerald-700' : 'text-slate-400'
              }`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">

          {/* Step 1 - Vehicle Info Form */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Vehicle Information</h2>
                <p className="text-slate-500 mt-1">Provide the registration info exactly as it appears on your Malaysian log card.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Plate Number</label>
                  <input
                    type="text"
                    placeholder="e.g. JRS 1234"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={vehicleData.plateNo}
                    onChange={(e) => setVehicleData({ ...vehicleData, plateNo: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Registration Year</label>
                  <input
                    type="number"
                    placeholder="2024"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={vehicleData.year}
                    onChange={(e) => setVehicleData({ ...vehicleData, year: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Make (Manufacturer)</label>
                  <input
                    type="text"
                    placeholder="e.g. Proton"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={vehicleData.make}
                    onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. X50"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={vehicleData.model}
                    onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">VIN / Chassis Number</label>
                  <input
                    type="text"
                    placeholder="17-digit code found on dashboard or log card"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={vehicleData.vin}
                    onChange={(e) => setVehicleData({ ...vehicleData, vin: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Insurance Expiry Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={vehicleData.insuranceExpiry}
                    onChange={(e) => setVehicleData({ ...vehicleData, insuranceExpiry: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Upload Documents */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Upload Documents</h2>
                <p className="text-slate-500 mt-1">Clear scans or photos are required for verification.</p>
              </div>

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

          {/* Step 3 - Payment & Review */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Review & Payment</h2>
                <p className="text-slate-500 mt-1">Confirm your vehicle details and complete payment.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Vehicle Summary */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Vehicle Summary</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-bold">Plate No</p>
                    <p className="font-bold text-slate-900">{vehicleData.plateNo}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-bold">Year</p>
                    <p className="font-bold text-slate-900">{vehicleData.year}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-bold">Make</p>
                    <p className="font-bold text-slate-900">{vehicleData.make}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase font-bold">Model</p>
                    <p className="font-bold text-slate-900">{vehicleData.model}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-400 text-xs uppercase font-bold">VIN</p>
                    <p className="font-mono font-bold text-slate-900">{vehicleData.vin}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-400 text-xs uppercase font-bold">Insurance Expiry</p>
                    <p className={`font-bold ${new Date(vehicleData.insuranceExpiry) < new Date() ? 'text-red-600' : 'text-emerald-600'}`}>
                      {vehicleData.insuranceExpiry ? new Date(vehicleData.insuranceExpiry).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment */}
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

        {/* Footer Navigation */}
        <div className="p-8 bg-slate-50 border-t flex items-center justify-between">
          <button
            onClick={step === 1 ? () => navigate('/driver/vehicles') : prevStep}
            className="px-6 py-3 text-slate-600 font-bold hover:underline"
            disabled={submitting}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={step === 3 ? handleSubmit : handleNext}
            disabled={submitting}
            className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : step === 3 ? 'Confirm & Pay' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationWizard;