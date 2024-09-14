import React from 'react';

const DescriptionIconSVG = () => (
  <svg className="inline w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const Footer = () => (
  <footer className="bg-gray-800 text-white p-4">
    <div className="container mx-auto text-center">
      <p>
        <a href="/readme" className="text-lime font-bold flex items-center justify-center">
          README <DescriptionIconSVG />
        </a>
      </p>
    </div>
  </footer>
);

export default Footer;
