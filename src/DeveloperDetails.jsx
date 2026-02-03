import React from 'react';
import { ChevronLeft, Code, Database, Palette, Users } from 'lucide-react';

const DeveloperDetails = ({ onNavigateBack, onNavigate }) => {
  const developers = [
    {
      id: 1,
      name: "Frontend Developer",
      role: "React & Mobile App Specialist",
      icon: Code,
      description: "Expert in creating responsive, modern user interfaces with React and mobile application development.",
      skills: ["React", "JavaScript", "Mobile Development", "UI/UX Implementation"]
    },
    {
      id: 2,
      name: "Backend Developer",
      role: "Node.js & Database Expert",
      icon: Database,
      description: "Specialized in server-side development, API creation, and database management with Node.js.",
      skills: ["Node.js", "Express", "Database Design", "API Development"]
    },
    {
      id: 3,
      name: "UI/UX Designer",
      role: "Modern Interface Specialist",
      icon: Palette,
      description: "Focused on creating intuitive, beautiful user experiences and modern interface designs.",
      skills: ["UI Design", "UX Research", "Prototyping", "User Testing"]
    }
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <button
          onClick={onNavigateBack}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
          <span className="text-gray-700 font-medium">Back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800">Developer Team</h1>
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center text-indigo-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-8 text-white text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Users className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Our Development Team</h1>
        <p className="text-indigo-100">The talented professionals behind this application</p>
      </div>
 {/* Contact Support Team */}
        <div className="mt-6 bg-indigo-50  p-6 border border-indigo-200" >
          <h3 className="font-bold text-gray-800 text-lg mb-4 text-center">Contact Support Team</h3>
          <div className="space-y-4">
            <a href="mailto:thermal.aig@gmail.com" className="block">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm font-medium text-gray-800">thermal.aig@gmail.com</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText('thermal.aig@gmail.com');
                    alert('Email copied to clipboard!');
                  }}
                  className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-200 transition-colors"
                >
                  Copy
                </button>
              </div>
            </a>
            
            <a href="tel:+919136373636" className="block">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Mobile</p>
                  <p className="text-sm font-medium text-gray-800">+91 9136373636</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText('+91 9136373636');
                    alert('Mobile number copied to clipboard!');
                  }}
                  className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-200 transition-colors"
                >
                  Copy
                </button>
              </div>
            </a>
          </div>
        </div>
      {/* Developers Grid */}
      <div className="px-6 py-6 flex-1">
        <div className="grid grid-cols-1 gap-6">
          {developers.map((developer) => (
            <div 
              key={developer.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="bg-indigo-50 p-3 rounded-xl flex-shrink-0">
                  <developer.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{developer.name}</h3>
                  <p className="text-indigo-600 font-medium text-sm mb-3">{developer.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{developer.description}</p>
                  
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {developer.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

       

        {/* Project Info */}
        <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-800 text-lg mb-3 text-center">About This Project</h3>
          <p className="text-gray-600 text-sm text-center leading-relaxed">
            This hospital management system was built with modern web technologies to provide 
            seamless healthcare services and efficient patient management. Our team worked 
            collaboratively to deliver a robust, user-friendly application.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">© 2026 Maharaja Agarsen Hospital. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDetails;