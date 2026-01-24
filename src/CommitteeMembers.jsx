import React, { useState, useEffect } from 'react';
import { User, Users, ChevronLeft, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { getProfilePhotos } from './services/api';

const CommitteeMembers = ({ committeeData, onNavigateBack, previousScreenName, onNavigate }) => {
  const [profilePhotos, setProfilePhotos] = useState({});

  useEffect(() => {
    const fetchPhotos = async () => {
      const committeeMembers = committeeData.committee_members || [];
      if (committeeMembers.length === 0) return;
      
      const memberIds = new Set();
      committeeMembers.forEach(item => {
        if (item.membership_number) memberIds.add(item.membership_number);
        if (item.phone1) memberIds.add(item.phone1);
        if (item.phone2) memberIds.add(item.phone2);
        if (item.Mobile) memberIds.add(item.Mobile);
        if (item.member_id) memberIds.add(item.member_id);
      });
      
      const idsToFetch = Array.from(memberIds).filter(id => id && id !== 'N/A');
      if (idsToFetch.length === 0) return;
      
      try {
        const response = await getProfilePhotos(idsToFetch);
        if (response.success && response.photos) {
          setProfilePhotos(prev => ({ ...prev, ...response.photos }));
        }
      } catch (err) {
        console.error('Error fetching committee profile photos:', err);
      }
    };
    
    fetchPhotos();
  }, [committeeData.committee_members]);

  const getMemberPhoto = (item) => {
    return profilePhotos[item.membership_number] || 
           profilePhotos[item.phone1] || 
           profilePhotos[item.phone2] || 
           profilePhotos[item.Mobile] || 
           profilePhotos[item.member_id];
  };

  // Get screen name for back button
  const getScreenName = () => {
    if (!previousScreenName) return 'Directory';
    
    // Handle both route paths and screen names
    const screenName = previousScreenName.replace(/^\//, ''); // Remove leading slash if present
    
    const screenNames = {
      'directory': 'Directory',
      '/directory': 'Directory',
      'healthcare-trustee-directory': 'Directory',
      '/healthcare-trustee-directory': 'Directory',
      'healthcare': 'Healthcare Directory',
      'trustees': 'Trustees',
      'patrons': 'Patrons',
      'committee': 'Committee',
      'doctors': 'Doctors',
      'hospitals': 'Hospitals',
      '/': 'Home'
    };
    
    return screenNames[previousScreenName] || screenNames[screenName] || 'Directory';
  };

  const committeeMembers = committeeData.committee_members || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white px-6 pt-6 pb-4 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={onNavigateBack}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 text-indigo-600"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{getScreenName()}</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Committee Members</h1>
            <p className="text-gray-600 text-sm">{committeeData.Name}</p>
          </div>
        </div>
      </div>

      {/* Committee Members List */}
      <div className="p-6">
        {committeeMembers.length > 0 ? (
          <div className="space-y-4">
            {committeeMembers.map((member, index) => (
                  <div 
                    key={member['S. No.'] || member.id || `member-${index}`} 
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
                    onClick={() => {
                      // Pass ALL Supabase data from committee_members table
                      const memberData = {
                        ...member, // Include all fields from Supabase
                        'S. No.': member['S. No.'] || member.id || `CM${index}`,
                        'Name': member.member_name_english || member.member_name_hindi || 'N/A',
                        'Mobile': member.Mobile || member.phone1 || member.phone2 || 'N/A',
                        'Email': member.Email || 'N/A',
                        'type': member.member_role || 'Committee Member',
                        'Membership number': member.membership_number || member.member_id || 'N/A',
                        'isCommitteeMember': true,
                        'previousScreenName': previousScreenName || 'committee',
                        // Include all other fields from Supabase
                        'member_name_english': member.member_name_english,
                        'member_name_hindi': member.member_name_hindi,
                        'member_role': member.member_role,
                        'committee_name_english': member.committee_name_english,
                        'committee_name_hindi': member.committee_name_hindi,
                        'phone1': member.phone1,
                        'phone2': member.phone2,
                        'address': member.address,
                        'Address Home': member['Address Home'],
                        'Address Office': member['Address Office'],
                        'id': member.id || member.original_id || null
                      };
                      
                      if (onNavigate) {
                        onNavigate('member-details', memberData);
                      }
                    }}
                  >
                    <div className="bg-indigo-50 h-16 w-16 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 overflow-hidden">
                      {getMemberPhoto(member) ? (
                        <img 
                          src={getMemberPhoto(member)} 
                          alt={member.member_name_english || member.member_name_hindi || 'Member'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const iconContainer = e.target.parentElement;
                            iconContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user h-7 w-7"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                          }}
                        />
                      ) : (
                        <User className="h-7 w-7" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                        {member.member_name_english || member.member_name_hindi || 'N/A'}
                      </h3>
                      <p className="text-indigo-600 text-sm font-medium mt-1">{member.member_role || 'N/A'}</p>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {(member.Mobile || member.phone1 || member.phone2) && (
                          <a 
                            href={`tel:${(member.Mobile || member.phone1 || member.phone2).replace(/\s+/g, '').split(',')[0]}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs font-semibold border border-gray-100"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            Call
                          </a>
                        )}
                        {member.Email && member.Email !== 'N/A' && member.Email.trim() && (
                          <a 
                            href={`mailto:${member.Email.trim()}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs font-semibold border border-gray-100"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </a>
                        )}
                        {(member.address || (member['Address Home'] && member['Address Home'] !== 'N/A')) && (
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 text-xs font-semibold border border-gray-100">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[150px]">{member.address || member['Address Home']}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-300">
              <Users className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-gray-800 font-bold">No members found</h3>
            <p className="text-gray-500 text-sm mt-1">This committee has no members</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitteeMembers;