import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Users, Stethoscope, Building2, Star, Award, ChevronRight, ChevronLeft, Menu, X, Home as HomeIcon, Clock, FileText, UserPlus, Phone, Mail, MapPin, Search, Filter, ArrowLeft, ArrowRight } from 'lucide-react';
import Sidebar from './components/Sidebar';
import { getAllMembers, getAllCommitteeMembers, getAllHospitals, getAllElectedMembers, getProfilePhotos } from './services/api';
import { getOpdDoctors } from './services/supabaseService';

const CACHE_KEY_HTD = 'healthcare_trustee_directory_cache';
const CACHE_TIMESTAMP_KEY_HTD = 'healthcare_trustee_directory_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const HealthcareTrusteeDirectory = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState(null); // null, 'healthcare', 'trustee', or 'committee'
  const [activeTab, setActiveTab] = useState(null);

  const [allMembers, setAllMembers] = useState([]);
  const [opdDoctors, setOpdDoctors] = useState([]); // doctors fetched directly from Supabase with image URLs
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [electedMembers, setElectedMembers] = useState([]);
  const [profilePhotos, setProfilePhotos] = useState({});
  const [loading, setLoading] = useState(false); // Changed to false - show page immediately
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLoaded, setDataLoaded] = useState(false);
  const itemsPerPage = 20;

  // Ref to track previous filtered members to avoid infinite loop
  const previousFilteredRef = useRef([]);

  // Ref for the content area to scroll to
  const contentRef = useRef(null);

  // Scroll locking when sidebar is open
  useEffect(() => {
    if (isMenuOpen) {
      const scrollY = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.touchAction = 'none';
    } else {
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      document.documentElement.style.overflow = 'unset';
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
      document.body.style.top = 'unset';
      document.body.style.touchAction = 'auto';
      window.scrollTo(0, scrollY);
    }
    return () => {
      document.documentElement.style.overflow = 'unset';
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
      document.body.style.top = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [isMenuOpen]);

  // Fetch all members, hospitals and member types when component mounts
  const fetchMembers = async (isBackground = false) => {
    let mounted = true;
    let hospitalsData = [];
    let committeeData = [];
    let electedData = [];

    try {
      if (!isBackground) {
        setLoading(true);
      }
      setError(null);
      console.log('Attempting to fetch all members...');
      const response = await getAllMembers();
      console.log('Full API response:', response);
      console.log('Fetched members data:', response.data);

      if (!mounted) return;

      setAllMembers(response.data || []);

      // Fetch doctors directly from Supabase so doctor_image_url is properly
      // resolved against the 'doctor-images' Storage bucket
      try {
        const doctorsResponse = await getOpdDoctors();
        if (doctorsResponse.success) {
          setOpdDoctors(doctorsResponse.data || []);
        }
      } catch (doctorsErr) {
        console.error('Error fetching doctors from Supabase:', doctorsErr);
      }
      // Fetch hospitals separately from the hospitals table
      try {
        const hospitalsResponse = await getAllHospitals();
        console.log('Hospitals response:', hospitalsResponse);
        hospitalsData = hospitalsResponse.data || [];
        setHospitals(hospitalsData);
      } catch (hospitalsErr) {
        console.error('Error fetching hospitals:', hospitalsErr);
        // Continue with empty hospitals array
        setHospitals([]);
      }

      // Fetch committee members separately from committee_members table
      try {
        const committeeResponse = await getAllCommitteeMembers();
        console.log('Committee members response:', committeeResponse);
        committeeData = committeeResponse.data || [];
        setCommitteeMembers(committeeData);
      } catch (committeeErr) {
        console.error('Error fetching committee members:', committeeErr);
        // Don't set error, just log it - committee members are optional
      }

      // Fetch elected members separately from elected_members table
      try {
        const electedResponse = await getAllElectedMembers();
        console.log('Elected members response:', electedResponse);
        electedData = electedResponse.data || [];
        setElectedMembers(electedData);
      } catch (electedErr) {
        console.error('Error fetching elected members:', electedErr);
        // Don't set error, just log it - elected members are optional
      }

      setDataLoaded(true);

      // Cache the data
      try {
        const cacheData = {
          allMembers: response.data || [],
          hospitals: hospitalsData,
          electedMembers: electedData,
          committeeMembers: committeeData
        };
        sessionStorage.setItem(CACHE_KEY_HTD, JSON.stringify(cacheData));
        sessionStorage.setItem(CACHE_TIMESTAMP_KEY_HTD, Date.now().toString());
      } catch (cacheErr) {
        console.error('Error caching data:', cacheErr);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(`Failed to load members data: ${err.message || 'Please make sure backend server is running on port 5000'}`);
    } finally {
      if (mounted && !isBackground) {
        setLoading(false);
      }
    }
  };

  // Restore directory and tab when coming back from member details
  useEffect(() => {
    const restoreDirectory = sessionStorage.getItem('restoreDirectory');
    const restoreTab = sessionStorage.getItem('restoreDirectoryTab');
    if (restoreDirectory) {
      setSelectedDirectory(restoreDirectory);
      if (restoreTab) {
        setActiveTab(restoreTab);
      } else if (restoreDirectory === 'healthcare') {
        setActiveTab('doctors');
      } else if (restoreDirectory === 'committee') {
        setActiveTab('committee');
      } else if (restoreDirectory === 'trustee') {
        setActiveTab('trustees');
      }
      sessionStorage.removeItem('restoreDirectory');
      sessionStorage.removeItem('restoreDirectoryTab');
    }
  }, []);

  // Load cached data if available
  useEffect(() => {
    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY_HTD);
      const cacheTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY_HTD);

      if (cachedData && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp, 10);
        if (cacheAge < CACHE_DURATION) {
          const parsed = JSON.parse(cachedData);
          setAllMembers(parsed.allMembers || []);
          setHospitals(parsed.hospitals || []);
          setElectedMembers(parsed.electedMembers || []);
          setCommitteeMembers(parsed.committeeMembers || []);
          setDataLoaded(true);
          // Still fetch fresh data in background but don't block UI
          fetchMembers(true);
          return;
        }
      }
    } catch (err) {
      console.error('Error loading cache:', err);
    }
    // No cache or expired cache - fetch data
    fetchMembers(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate counts for each category
  const getTrusteesCount = () => allMembers.filter(m => {
    if (!m.type) return false;
    const typeLower = m.type.toLowerCase().trim();
    return typeLower === 'trustee' || typeLower === 'trustees';
  }).length;

  const getPatronsCount = () => allMembers.filter(m => {
    if (!m.type) return false;
    const typeLower = m.type.toLowerCase().trim();
    return typeLower === 'patron' || typeLower === 'patrons';
  }).length;

  const getCommitteeCount = () => {
    // Count committee members from committee_members table
    return committeeMembers.length;
  };

  const getDoctorsCount = () => opdDoctors.length > 0 ? opdDoctors.length : allMembers.filter(m =>
    (m.type && (m.type.toLowerCase().includes('doctor') ||
      m.type.toLowerCase().includes('medical'))) ||
    m.specialization ||
    m.designation ||
    (m.consultant_name && m.department) // This indicates it's from opd_schedule
  ).length;

  const getHospitalsCount = () => hospitals.length;

  const getElectedMembersCount = () => electedMembers.length;

  // Function to get members based on selected directory and tab
  const getMembersByDirectoryAndTab = useCallback((directory, tabId) => {
    if (directory === 'healthcare') {
      if (tabId === 'doctors') {
        // Prefer opdDoctors (direct Supabase fetch with proper image URLs)
        if (opdDoctors.length > 0) return opdDoctors;
        // Fallback to allMembers if Supabase fetch hasn't returned yet
        return allMembers.filter(member =>
          (member.type && (
            member.type.toLowerCase().includes('doctor') ||
            member.type.toLowerCase().includes('medical')
          )) || member.specialization || member.designation || (member.consultant_name && member.department)
        );
      } else if (tabId === 'hospitals') {
        // Return hospitals from the separate hospitals array
        return hospitals;
      }
    } else if (directory === 'trustee') {
      if (tabId === 'trustees') {
        // Get trustees from allMembers
        const trustees = allMembers.filter(member => {
          if (!member.type) return false;
          const typeLower = member.type.toLowerCase().trim();
          return typeLower === 'trustee' || typeLower === 'trustees';
        });

        // Also add elected members who are trustees (merged data already includes member table data)
        const electedTrustees = electedMembers.filter(elected => {
          // Check if this elected member's type indicates they're a trustee (from merged member table data)
          return elected.type && (
            elected.type.toLowerCase().includes('trustee') ||
            elected.type.toLowerCase() === 'trustee' ||
            elected.type.toLowerCase() === 'trustees'
          );
        });

        // Also add elected members that are not already included (in case merging failed)
        const additionalElectedTrustees = electedMembers.filter(elected => {
          // If not already in electedTrustees and not in trustees, include if it's an elected member
          const alreadyIncluded = electedTrustees.some(et =>
            (et['Membership number'] && elected['Membership number'] &&
              et['Membership number'] === elected['Membership number']) ||
            (et['S. No.'] && elected['S. No.'] && et['S. No.'] === elected['S. No.']) ||
            (et.elected_id && elected.elected_id && et.elected_id === elected.elected_id)
          );
          const inTrustees = trustees.some(t =>
            (t['Membership number'] && elected['Membership number'] &&
              t['Membership number'] === elected['Membership number']) ||
            (t['S. No.'] && elected['S. No.'] && t['S. No.'] === elected['S. No.'])
          );
          return !alreadyIncluded && !inTrustees && elected.is_elected_member;
        });

        // Combine and remove duplicates based on membership number
        const combined = [...trustees, ...electedTrustees, ...additionalElectedTrustees];
        const unique = combined.filter((item, index, self) =>
          index === self.findIndex(i =>
            (i['Membership number'] && item['Membership number'] && i['Membership number'] === item['Membership number']) ||
            (i['S. No.'] && item['S. No.'] && i['S. No.'] === item['S. No.']) ||
            (i.elected_id && item.elected_id && i.elected_id === item.elected_id)
          )
        );

        return unique;
      } else if (tabId === 'patrons') {
        // Get patrons from allMembers
        const patrons = allMembers.filter(member => {
          if (!member.type) return false;
          const typeLower = member.type.toLowerCase().trim();
          return typeLower === 'patron' || typeLower === 'patrons';
        });

        // Also add elected members who are patrons (merged data already includes member table data)
        const electedPatrons = electedMembers.filter(elected => {
          // Check if this elected member's type indicates they're a patron (from merged member table data)
          return elected.type && (
            elected.type.toLowerCase().includes('patron') ||
            elected.type.toLowerCase() === 'patron' ||
            elected.type.toLowerCase() === 'patrons'
          );
        });

        // Combine and remove duplicates based on membership number
        const combined = [...patrons];
        electedPatrons.forEach(elected => {
          const exists = combined.some(p =>
            (p['Membership number'] && elected['Membership number'] &&
              p['Membership number'] === elected['Membership number']) ||
            (p['S. No.'] && elected['S. No.'] && p['S. No.'] === elected['S. No.'])
          );
          if (!exists) {
            combined.push(elected);
          }
        });

        return combined;
      }
    } else if (directory === 'committee') {
      if (tabId === 'elected') {
        // Return elected members from elected_members table
        return electedMembers;
      } else {
        // Return unique committee names instead of individual members
        const uniqueCommittees = [...new Set(committeeMembers.map(cm => cm.committee_name_english || cm.committee_name_hindi))]
          .filter(name => name && name !== 'N/A')
          .map((committeeName, index) => ({
            'S. No.': `COM${index}`,
            'Name': committeeName,
            'type': 'Committee',
            'committee_name_english': committeeMembers.find(cm => (cm.committee_name_english || cm.committee_name_hindi) === committeeName)?.committee_name_english || committeeName,
            'committee_name_hindi': committeeMembers.find(cm => (cm.committee_name_english || cm.committee_name_hindi) === committeeName)?.committee_name_hindi || committeeName,
            'is_committee_group': true
          }));
        return uniqueCommittees;
      }
    }
    return [];
  }, [allMembers, opdDoctors, hospitals, electedMembers, committeeMembers]);

  // Healthcare Directory Tabs
  const healthcareTabs = [
    { id: 'doctors', label: `Doctors (${getDoctorsCount()})`, icon: Stethoscope },
    { id: 'hospitals', label: `Hospitals (${getHospitalsCount()})`, icon: Building2 },
  ];

  // Trustee Directory Tabs
  const trusteeTabs = [
    { id: 'trustees', label: `Trustees (${getTrusteesCount()})`, icon: Star },
    { id: 'patrons', label: `Patrons (${getPatronsCount()})`, icon: Award },
  ];

  // Committee Directory Tabs
  const committeeTabs = [
    { id: 'elected', label: `Elected (${getElectedMembersCount()})`, icon: Star },
    { id: 'committee', label: `Committee (${getCommitteeCount()})`, icon: Users },
  ];

  // Get current tabs based on selected directory
  const currentTabs = selectedDirectory === 'healthcare' ? healthcareTabs :
    selectedDirectory === 'committee' ? committeeTabs : trusteeTabs;

  // Filter members based on current selection and search
  useEffect(() => {
    let membersToFilter = [];

    if (selectedDirectory && currentTabs.length > 0) {
      // Get members for the currently selected tab
      const currentTabId = activeTab || currentTabs[0]?.id; // Use active tab if set, otherwise default to first tab
      membersToFilter = getMembersByDirectoryAndTab(selectedDirectory, currentTabId);
    } else {
      membersToFilter = [];
    }

    // Apply search filter
    const filtered = membersToFilter.filter(item =>
      (item.Name && item.Name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.hospital_name && item.hospital_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.member_name_english && item.member_name_english.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item['Company Name'] && item['Company Name'].toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.trust_name && item.trust_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.committee_name_hindi && item.committee_name_hindi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.hospital_type && item.hospital_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.member_role && item.member_role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item['Membership number'] && item['Membership number'].toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.designation && item.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.city && item.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.consultant_name && item.consultant_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.position && item.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.member_id && item.member_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.Mobile && item.Mobile.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.Mobile2 && item.Mobile2.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Only update if the filtered members have actually changed
    const hasChanged = filtered.length !== previousFilteredRef.current.length ||
      !filtered.every((item, index) => item['S. No.'] === previousFilteredRef.current[index]?.['S. No.']);

    if (hasChanged) {
      setFilteredMembers(filtered);
      previousFilteredRef.current = filtered;
      // Reset to first page when search, tab, or directory changes
      setCurrentPage(1);
    }
  }, [selectedDirectory, activeTab, searchQuery, allMembers, committeeMembers, currentTabs]); // getMembersByDirectoryAndTab is stable due to useCallback

  // Scroll to top of container when component mounts
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageMembers = filteredMembers.slice(startIndex, endIndex);

  // Fetch profile photos for the current page members
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!currentPageMembers.length) return;

      const memberIds = new Set();
      currentPageMembers.forEach(item => {
        // Collect all possible identifiers
        if (item['Membership number']) memberIds.add(item['Membership number']);
        if (item.membership_number) memberIds.add(item.membership_number);
        if (item.Mobile) memberIds.add(item.Mobile);
        if (item.mobile) memberIds.add(item.mobile);
        if (item.phone1) memberIds.add(item.phone1);
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
        console.error('Error fetching profile photos:', err);
      }
    };

    fetchPhotos();
  }, [currentPageMembers]);

  // Helper to get photo for a member
  const getMemberPhoto = (item) => {
    // For doctors from opd_schedule, use doctor_image_url directly
    if (item.doctor_image_url) return item.doctor_image_url;
    return profilePhotos[item['Membership number']] ||
      profilePhotos[item.membership_number] ||
      profilePhotos[item.Mobile] ||
      profilePhotos[item.mobile] ||
      profilePhotos[item.phone1] ||
      profilePhotos[item.member_id];
  };

  const containerRef = useRef(null);

  return (
    <div className={`bg-white h-screen flex flex-col relative${isMenuOpen ? ' overflow-hidden' : ' overflow-hidden'}`} ref={containerRef}>
      {/* Navbar - Matching Home.jsx */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm mt-6 pointer-events-auto">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors pointer-events-auto"
        >
          {isMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
        </button>
        <h1 className="text-lg font-bold text-gray-800">
          {selectedDirectory ? (selectedDirectory === 'healthcare' ? 'Healthcare Directory' :
            selectedDirectory === 'committee' ? 'Committee Directory' : 'Trustee & Patron Directory') : 'Directory Selection'}
        </h1>
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center text-indigo-600"
        >
          <HomeIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar */}
      {error && (
        <div className="px-6 py-4 flex-shrink-0">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchMembers(false);
              }}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading && !dataLoaded && (
        <div className="px-6 py-4 flex-shrink-0">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      )}

      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
        currentPage="healthcare-directory"
      />

      {/* ── Scrollable content area ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Directory Selection Screen */}
        {!selectedDirectory && (
          <div className="px-6 pt-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Directory Selection</h1>
              <p className="text-gray-600">Choose the directory you want to explore</p>
            </div>

            <div className="space-y-4">
              {/* Committee Directory Card */}
              <div
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedDirectory('committee');
                  setActiveTab('committee'); // Set first tab immediately to show data
                  setSearchQuery('');
                }}
              >
                <div className="bg-indigo-50 h-16 w-16 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Users className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                    Committee Directory
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">Find Committee Members</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                      {getCommitteeCount()} Committee
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Trustee Directory Card */}
              <div
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedDirectory('trustee');
                  setActiveTab('trustees'); // Set first tab immediately to show data
                }}
              >
                <div className="bg-indigo-50 h-16 w-16 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Star className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                    Trustee And Patron Directory
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">Find Trustees & Patrons</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">
                      {getTrusteesCount()} Trustees
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                      {getPatronsCount()} Patrons
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Healthcare Directory Card */}
              <div
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedDirectory('healthcare');
                  setActiveTab('doctors'); // Set first tab immediately to show data
                }}
              >
                <div className="bg-indigo-50 h-16 w-16 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Building2 className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                    Healthcare Directory
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">Find Doctors & Hospitals</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold">
                      {getDoctorsCount()} Doctors
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                      {getHospitalsCount()} Hospitals
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Healthcare or Trustee Directory View */}
        {selectedDirectory && (
          <div>
            {/* Header Section */}
            <div className="bg-white px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSelectedDirectory(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center text-indigo-600"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center flex-1 mx-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {selectedDirectory === 'healthcare' ? 'Healthcare Directory' :
                        selectedDirectory === 'committee' ? 'Committee Directory' : 'Trustee & Patron Directory'}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">
                      {selectedDirectory === 'healthcare' ? 'Find Doctors & Hospitals' :
                        selectedDirectory === 'committee' ? 'Find Committee Members' : 'Find Trustees & Patrons'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="px-6 mt-4">
              <div className="bg-gray-50 rounded-2xl p-2 flex items-center gap-3 border border-gray-200 focus-within:border-indigo-300 transition-all shadow-sm">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 ml-1">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <input
                  type="text"
                  placeholder={`Search in ${selectedDirectory === 'healthcare' ? 'Healthcare' :
                    selectedDirectory === 'committee' ? 'Committee' : 'Trustee'} directory...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 font-medium text-sm py-2"
                />
              </div>
            </div>

            {/* Tabs - Modern Pill Style */}
            <div className="px-6 mt-6">
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {currentTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all text-xs tracking-tight ${activeTab === tab.id || (!activeTab && currentTabs[0]?.id === tab.id)
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 border border-indigo-600'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                  >
                    <tab.icon className={`h-4 w-4 ${(activeTab === tab.id || (!activeTab && currentTabs[0]?.id === tab.id)) ? 'text-white' : 'text-indigo-600'}`} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content List - Modern Cards */}
            <div className="px-6 mt-2 space-y-4" ref={contentRef}>
              {loading && !dataLoaded ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Loading directory...</p>
                  </div>
                </div>
              ) : currentPageMembers.length > 0 ? (
                currentPageMembers.map((item) => (
                  <div
                    key={item['S. No.'] || item.id || Math.random()}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer"
                    onClick={() => {
                      // Check if this is a committee group (committee name)
                      if (item.is_committee_group) {
                        // Navigate to a new view showing all members of this committee
                        const filteredCommitteeMembers = committeeMembers.filter(cm =>
                          (cm.committee_name_english === item.Name) || (cm.committee_name_hindi === item.Name)
                        );

                        const committeeData = {
                          'Name': item.Name,
                          'type': 'Committee',
                          'committee_members': filteredCommitteeMembers,
                          'committee_name_english': item.committee_name_english,
                          'committee_name_hindi': item.committee_name_hindi,
                          'is_committee_group': true
                        };

                        // Add the current directory type as the previous screen name
                        committeeData.previousScreenName = selectedDirectory;

                        // Store the current directory and tab in sessionStorage to restore when coming back
                        sessionStorage.setItem('restoreDirectory', selectedDirectory);
                        sessionStorage.setItem('restoreDirectoryTab', activeTab);

                        onNavigate('committee-members', committeeData);
                      } else {
                        // Navigate to member details page
                        // Determine if this is a healthcare member (from opd_schedule)
                        const isHealthcareMember = !!item.consultant_name || (item.original_id && item.original_id.toString().startsWith('DOC'));
                        // Determine if this is a committee member (from committee_members table)
                        const isCommitteeMember = !!item.is_committee_member || (item.original_id && item.original_id.toString().startsWith('CM'));
                        // Determine if this is a hospital member (from hospitals table)
                        const isHospitalMember = !!item.is_hospital ||
                          (item.original_id && item.original_id.toString().startsWith('HOSP')) ||
                          (item['S. No.'] && item['S. No.'].toString().startsWith('HOSP'));
                        // Determine if this is an elected member (from elected_members table)
                        const isElectedMember = !!item.is_elected_member ||
                          (item.elected_id !== undefined && item.elected_id !== null) ||
                          (item.original_id && item.original_id.toString().startsWith('ELECT')) ||
                          (item['S. No.'] && item['S. No.'].toString().startsWith('ELECT'));

                        // Create member data based on the source
                        const memberData = {
                          'S. No.': item['S. No.'] || item.original_id || `MEM${Math.floor(Math.random() * 10000)}`,
                          'Name': item.member_name_english || item.Name || item.hospital_name || item.consultant_name || 'N/A',
                          'Mobile': item.Mobile || item.contact_phone || item.mobile || 'N/A',
                          'Email': item.Email || item.contact_email || item.email || 'N/A',
                          'type': item.member_role || item.type || item.Type || 'N/A',
                          'Membership number': item['Membership number'] || item.membership_number || 'N/A',
                          'isHealthcareMember': isHealthcareMember,
                          'isCommitteeMember': isCommitteeMember,
                          'isHospitalMember': isHospitalMember,
                          'isElectedMember': isElectedMember
                        };

                        // Add hospital-specific fields (from hospitals table) only if it's a hospital member
                        if (isHospitalMember) {
                          memberData.hospital_name = item.hospital_name || 'N/A';
                          memberData.trust_name = item.trust_name || 'N/A';
                          memberData.hospital_type = item.hospital_type || 'N/A';
                          memberData.address = item.address || 'N/A';
                          memberData.city = item.city || 'N/A';
                          memberData.state = item.state || 'N/A';
                          memberData.pincode = item.pincode || 'N/A';
                          memberData.established_year = item.established_year || 'N/A';
                          memberData.bed_strength = item.bed_strength || 'N/A';
                          memberData.accreditation = item.accreditation || 'N/A';
                          memberData.facilities = item.facilities || 'N/A';
                          memberData.departments = item.departments || 'N/A';
                          memberData.contact_phone = item.contact_phone || 'N/A';
                          memberData.contact_email = item.contact_email || 'N/A';
                          memberData.is_active = item.is_active || 'N/A';
                          memberData.id = item.original_id || null;
                        } else if (isCommitteeMember) {
                          // Add committee-specific fields (from committee_members table)
                          memberData.committee_name_hindi = item.committee_name_hindi || 'N/A';
                          memberData.member_name_english = item.member_name_english || 'N/A';
                          memberData.member_role = item.member_role || 'N/A';
                          memberData['Company Name'] = item.committee_name_hindi || item['Company Name'] || 'N/A';
                        } else if (!isHealthcareMember && !isElectedMember) {
                          // Add general member fields (from Members Table) only if not healthcare, committee, or elected
                          if (item['Company Name']) memberData['Company Name'] = item['Company Name'];
                          if (item['Address Home']) memberData['Address Home'] = item['Address Home'];
                          if (item['Address Office']) memberData['Address Office'] = item['Address Office'];
                          if (item['Resident Landline']) memberData['Resident Landline'] = item['Resident Landline'];
                          if (item['Office Landline']) memberData['Office Landline'] = item['Office Landline'];
                        }

                        // Add Members Table fields for elected members (since they're merged with Members Table)
                        if (isElectedMember) {
                          if (item['Company Name']) memberData['Company Name'] = item['Company Name'];
                          if (item['Address Home']) memberData['Address Home'] = item['Address Home'];
                          if (item['Address Office']) memberData['Address Office'] = item['Address Office'];
                          if (item['Resident Landline']) memberData['Resident Landline'] = item['Resident Landline'];
                          if (item['Office Landline']) memberData['Office Landline'] = item['Office Landline'];

                          // Add elected-specific fields from elected_members table
                          memberData.position = item.position || 'N/A';
                          memberData.location = item.location || 'N/A';
                          memberData.elected_id = item.elected_id || item.original_id || null;
                          memberData.membership_number_elected = item.membership_number || item['Membership number'] || 'N/A';
                          memberData.created_at = item.created_at || 'N/A';
                          memberData.is_merged_with_member = item.is_merged_with_member || false;
                        }

                        // Add healthcare-specific fields (from opd_schedule) only if it's a healthcare member
                        if (isHealthcareMember) {
                          memberData.department = item.department || 'N/A';
                          memberData.designation = item.designation || item.specialization || 'N/A';
                          memberData.qualification = item.qualification || 'N/A';
                          memberData.senior_junior = item.senior_junior || 'N/A';
                          memberData.unit = item.unit || 'N/A';
                          memberData.general_opd_days = item.general_opd_days || 'N/A';
                          memberData.private_opd_days = item.private_opd_days || 'N/A';
                          memberData.unit_notes = item.unit_notes || 'N/A';
                          memberData.consultant_name = item.consultant_name || item.Name || 'N/A';
                          memberData.notes = item.notes || item.unit_notes || 'N/A';
                          memberData.id = item.id || item.original_id || null;
                        } else if (!isCommitteeMember && !isHospitalMember && !isElectedMember) {
                          // For non-healthcare, non-committee, non-hospital, non-elected members, use original field values if they exist
                          if (item.designation) memberData.designation = item.designation;
                          if (item.qualification) memberData.qualification = item.qualification;
                          if (item.notes) memberData.notes = item.notes;
                        }

                        // Add the current directory type as the previous screen name
                        memberData.previousScreenName = selectedDirectory;

                        // Store the current directory and tab in sessionStorage to restore when coming back
                        sessionStorage.setItem('restoreDirectory', selectedDirectory);
                        sessionStorage.setItem('restoreDirectoryTab', activeTab);

                        onNavigate('member-details', memberData);
                      }
                    }}
                  >
                    {/* Avatar / Doctor Image */}
                    {selectedDirectory === 'healthcare' && activeTab === 'doctors' ? (
                      // ── Doctor card: large image + rich details ──
                      <div className="flex gap-4 w-full">
                        {/* Doctor Photo */}
                        <div className="flex-shrink-0 h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200/50 shadow-sm">
                          {getMemberPhoto(item) ? (
                            <img
                              src={getMemberPhoto(item)}
                              alt={item.consultant_name || item.Name || 'Doctor'}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <Stethoscope className="h-8 w-8 text-indigo-500" />
                          )}
                        </div>

                        {/* Doctor Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                              {item.consultant_name || item.Name || 'N/A'}
                            </h3>
                            <div className="bg-gray-50 p-1.5 rounded-full group-hover:bg-indigo-50 flex-shrink-0">
                              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-400" />
                            </div>
                          </div>

                          {/* Department */}
                          {item.department && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {item.department}
                            </span>
                          )}

                          {/* Designation + Qualification */}
                          {(item.designation || item.qualification) && (
                            <p className="text-purple-700 text-[10px] font-semibold bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1">
                              {[item.designation, item.qualification].filter(Boolean).join(' | ')}
                            </p>
                          )}

                          {/* Experience + Fee row */}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {item.experience_years && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {item.experience_years}+ yrs exp
                              </span>
                            )}
                            {item.consultation_fee && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                ₹{item.consultation_fee} fee
                              </span>
                            )}
                          </div>

                          {/* OPD Days */}
                          {(item.general_opd_days || item.private_opd_days) && (
                            <p className="text-gray-500 text-[10px] mt-1.5 leading-relaxed">
                              {item.general_opd_days && <span><span className="font-semibold text-gray-600">OPD:</span> {item.general_opd_days}</span>}
                              {item.general_opd_days && item.private_opd_days && ' · '}
                              {item.private_opd_days && <span><span className="font-semibold text-gray-600">Pvt:</span> {item.private_opd_days}</span>}
                            </p>
                          )}

                          {/* Call button */}
                          {(item.mobile || item.Mobile) && (
                            <a
                              href={`tel:${(item.mobile || item.Mobile).replace(/\s+/g, '').split(',')[0]}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 mt-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                            >
                              <Phone className="h-3 w-3" />
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      // ── Generic card for hospitals, trustees, patrons, committee ──
                      <>
                        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 h-16 w-16 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-300 overflow-hidden shadow-sm border border-indigo-200/50 group-hover:border-transparent group-hover:shadow-md flex-shrink-0">
                          {getMemberPhoto(item) ? (
                            <img
                              src={getMemberPhoto(item)}
                              alt={item.member_name_english || item.Name || 'Member'}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                            />
                          ) : (
                            selectedDirectory === 'healthcare' ? <Stethoscope className="h-7 w-7" /> :
                              selectedDirectory === 'committee' ? <Users className="h-7 w-7" /> : <Star className="h-7 w-7" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-800 text-base leading-tight group-hover:text-indigo-600 transition-colors">
                                {item.member_name_english || item.Name || 'N/A'}
                              </h3>
                              <div className="flex flex-col gap-1 mt-1">
                                {item['Membership number'] && (
                                  <p className="text-gray-500 text-xs font-medium">{item['Membership number']}</p>
                                )}
                                {!(selectedDirectory === 'healthcare' && (activeTab === 'doctors' || activeTab === 'hospitals')) && (
                                  <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full inline-block group-hover:bg-indigo-100 transition-colors">
                                    {item.position || item.member_role || item.type || item['Company Name'] || 'N/A'}
                                  </p>
                                )}
                                {item.location && (
                                  <p className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />{item.location}
                                  </p>
                                )}
                                {(item.committee_name_hindi || item['Company Name'] || (item.department && activeTab !== 'doctors')) && (
                                  <p className="text-indigo-700 text-xs mt-1 font-bold bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                                    {item.committee_name_hindi || item.department || item['Company Name']}
                                  </p>
                                )}
                                {(item.hospital_type || item.trust_name) && (
                                  <p className="text-gray-600 text-xs mt-1">{item.hospital_type || item.trust_name}</p>
                                )}
                                {(item.designation || item.qualification) && (
                                  <p className="text-purple-700 text-xs font-bold bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                                    {item.designation}{item.qualification ? ` | ${item.qualification}` : ''}
                                  </p>
                                )}
                                {item.city && (
                                  <p className="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />{item.city}{item.state ? `, ${item.state}` : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-4 flex-wrap">
                            {item.Mobile && (
                              <a href={`tel:${item.Mobile.replace(/\s+/g, '').split(',')[0]}`}
                                className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs font-semibold border border-gray-100">
                                <Phone className="h-3.5 w-3.5" />Call
                              </a>
                            )}
                            {item.Email && item.Email.trim() && (
                              <a href={`mailto:${item.Email.trim()}`}
                                className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs font-semibold border border-gray-100">
                                <User className="h-3.5 w-3.5" />Email
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-full group-hover:bg-indigo-50 transition-colors flex-shrink-0">
                          <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-300">
                    <User className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-gray-800 font-bold">No results found</h3>
                  <p className="text-gray-500 text-sm mt-1">Try searching with a different keyword</p>
                </div>
              )}
            </div>

            {/* Pagination Controls - Improved Design */}
            {filteredMembers.length > itemsPerPage && (
              <div className="px-6 mt-6 mb-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100 shadow-sm">
                  <div className="flex flex-col items-center gap-4">
                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-2 justify-center w-full">
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`p-2.5 rounded-xl transition-all shadow-sm ${currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-md border border-indigo-200'
                          }`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${currentPage === pageNum
                                ? 'bg-indigo-600 text-white shadow-md scale-105'
                                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <span className="px-2 text-gray-400 font-bold">...</span>
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              className="w-10 h-10 rounded-xl font-bold text-sm bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-gray-200 shadow-sm"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2.5 rounded-xl transition-all shadow-sm ${currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-md border border-indigo-200'
                          }`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Showing Text Below Buttons */}
                    <div className="text-sm text-gray-700 font-medium text-center">
                      Showing <span className="font-bold text-indigo-600">{startIndex + 1}</span> to{' '}
                      <span className="font-bold text-indigo-600">
                        {Math.min(endIndex, filteredMembers.length)}
                      </span>{' '}
                      of <span className="font-bold text-indigo-600">{filteredMembers.length}</span> members
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Extra Space for Bottom Nav */}
        <div className="h-10"></div>
      </div>
    </div>
  );
};

export default HealthcareTrusteeDirectory;
