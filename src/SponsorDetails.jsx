import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getSponsors } from './services/api';

const SponsorDetails = ({ onBack }) => {
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSponsorDetails = async () => {
      try {
        setLoading(true);
        const response = await getSponsors();
        if (response.success && response.data && response.data.length > 0) {
          // Get the first active sponsor (highest priority)
          setSponsor(response.data[0]);
          console.log('✅ Sponsor details loaded:', response.data[0].name);
        }
      } catch (error) {
        console.error('Error loading sponsor details:', error);
        // Keep a default sponsor if fetch fails
        setSponsor({
          name: 'Dr. Meena Subhash Gupta',
          position: 'President',
          positions: [
            'President',
            'Founder Chairperson - Mahila Mandal Punjabi Bagh',
            'Vice Chairperson - Innovative Co-Operative Bank',
            'Chairperson - Nav Dristhi Education & Welfare Society'
          ],
          about: 'Dr. Meena Subhash Gupta is a renowned leader with extensive experience in healthcare and social welfare. She has been instrumental in advancing community services.',
          photo_url: '/assets/president.png',
          affiliation: 'Maharaja Agrasen Hospital'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSponsorDetails();
  }, []);
  
  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sponsor details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Sponsor Details</h1>
      </div>

      <div className="flex justify-center items-start pt-6 pb-6 px-4">
        <div className="w-full max-w-md bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl overflow-hidden shadow-lg border border-gray-100">
          {/* Profile Header */}
          <div className="pt-8 pb-6 px-6">
            
            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-28 h-28 bg-white p-1 rounded-2xl shadow-xl border-4 border-indigo-100">
                  <img
                    src={sponsor ? sponsor.photo_url : '/assets/president.png'}
                    alt={sponsor ? sponsor.name : 'Dr. Meena Subhash Gupta'}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden items-center justify-center w-full h-full text-gray-400">
                    <div className="text-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mx-auto" />
                      <p className="text-xs mt-1">Photo</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  {sponsor ? sponsor.position : 'President'}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{sponsor ? sponsor.name : 'Dr. Meena Subhash Gupta'}</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-indigo-600 text-sm uppercase tracking-wide mb-3 font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1zM8 8a1 1 0 000 2h4a1 1 0 100-2H8zm2 4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
                  Positions
                </h3>
                <div className="space-y-3">
                  {(sponsor && sponsor.positions && sponsor.positions.length > 0) ? 
                    sponsor.positions.map((position, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-800 font-medium text-sm">{position}</p>
                      </div>
                    ))
                  : 
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-800 font-medium text-sm">President</p>
                    </div>
                  }
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-indigo-600 text-sm uppercase tracking-wide mb-3 font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  Affiliation
                </h3>
                <p className="text-gray-800 font-medium text-sm">{sponsor ? sponsor.affiliation || 'Maharaja Agrasen Hospital' : 'Maharaja Agrasen Hospital'}</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-indigo-600 text-sm uppercase tracking-wide mb-3 font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                  About
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {sponsor ? sponsor.about : 'Dr. Meena Subhash Gupta is a renowned leader with extensive experience in healthcare and social welfare. She has been instrumental in advancing community services.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorDetails;