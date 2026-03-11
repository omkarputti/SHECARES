import React from "react";
import { Loader } from "lucide-react";

type SosState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success', location: GeolocationCoordinates }
  | { status: 'error', message: string };

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  sosState: SosState;
  onRetry: () => void;
  emergencyContacts: { name: string; phone: string }[];
}

const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, sosState, onRetry, emergencyContacts }) => {
  if (!isOpen) {
    return null;
  }

  const renderContent = () => {
    switch (sosState.status) {
      case 'loading':
        return (
          <div className="text-center py-6">
            <Loader className="animate-spin mx-auto h-12 w-12 text-blue-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-800">Finding your location...</h3>
            <p className="text-sm text-gray-500">Please approve the location request.</p>
          </div>
        );

      case 'success':
        const { location } = sosState;
        const mapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
        const message = `Emergency! My current location is: ${mapLink}`;
        const contactNumbers = emergencyContacts.map(c => c.phone).join(',');
        
        return (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-green-700 mb-2">Location Found!</h3>
            <p className="text-sm text-gray-600 mb-4">Share this information immediately.</p>
            <div className="bg-green-50 p-4 rounded-lg text-left text-sm text-gray-800 break-words mb-4">
              <a href={mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-block font-semibold">View on Google Maps</a>
            </div>
            <div className="space-y-2">
              {contactNumbers ? (
                <a href={`sms:${contactNumbers}?body=${encodeURIComponent(message)}`} className="block w-full text-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">Share with Emergency Contacts</a>
              ) : (
                <a href={`sms:?body=${encodeURIComponent(message)}`} className="block w-full text-center bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300">Share via SMS (No contacts saved)</a>
              )}
              <a href="tel:112" className="block w-full text-center bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300">Call Emergency Services (112)</a>
              <button onClick={onClose} className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">Close</button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-700 mb-2">Location Error</h3>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{sosState.message}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={onRetry} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">Retry</button>
              <button onClick={onClose} className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">Close</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative z-50">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-md">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSModal;