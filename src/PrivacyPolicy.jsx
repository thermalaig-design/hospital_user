import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBackNavigation } from './hooks';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  useBackNavigation(); // Default: uses window.history.back()

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-blue-600 text-white p-4 flex items-center gap-4 mt-6">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Privacy Policy</h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4 text-gray-700">
        <section>
          <h2 className="text-lg font-bold text-blue-800">1. Data Collection</h2>
          <p>We collect personal information such as name, mobile number, and medical related data to provide hospital services efficiently.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800">2. How We Use Data</h2>
          <p>Your data is used to manage appointments, provide medical reports, and maintain the trustee directory. We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800">3. Data Security</h2>
          <p>We implement security measures to protect your information from unauthorized access, alteration, or disclosure. However, no electronic transmission is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800">4. Third-Party Services</h2>
          <p>We may use third-party services for SMS notifications and database management (like Supabase and Msg91) which have their own privacy policies.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800">5. User Rights</h2>
          <p>You have the right to access, update, or request deletion of your personal information through the profile section or by contacting administration.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800">6. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact Maharaja Agarsen Hospital administration.</p>
        </section>

        <section className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 italic">Last updated: January 2026</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
