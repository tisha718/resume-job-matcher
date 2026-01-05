import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Briefcase className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">SmartRecruit</span>
            </div>
            <p className="text-sm">
              AI-powered recruitment platform for smarter hiring decisions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-blue-400 transition-colors">Sign Up</Link>
              </li>
      
            </ul>
          </div>


          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-1" />
                <span>contact@smartrecruit.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-1" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span>123 Tech Street, San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; 2025 SmartRecruit. All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;