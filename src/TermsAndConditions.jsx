import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBackNavigation } from './hooks';

const TermsAndConditions = () => {
  const navigate = useNavigate();
  useBackNavigation(); // Default: uses window.history.back()

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="bg-blue-600 text-white p-4 flex items-center gap-4 mt-6">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Terms & Conditions</h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4 text-gray-700">
        <section>
          <h2 className="text-lg font-bold text-blue-800">1. Acceptance of Terms</h2>
          <p>By accessing and using this application, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the application.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800">2. Description of Service</h2>
          <p>This application provides services for hospital management, including appointment booking, member directory access, and medical reports tracking for Maharaja Agarsen Hospital.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800">3. User Obligations</h2>
          <p>Users must provide accurate information when registering and using the services. You are responsible for maintaining the confidentiality of your account credentials.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800">4. Privacy</h2>
          <p>Your use of the application is also governed by our Privacy Policy. Please review it to understand how we collect and use your data.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800">5. Limitation of Liability</h2>
          <p>The hospital and application developers are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-blue-800">6. Modifications</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the application after changes implies acceptance of the new terms.</p>
        </section>

        <section className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 italic">Last updated: January 2026</p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
