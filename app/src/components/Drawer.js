import React from 'react';

export default function TemporaryDrawer({ drawerOpen, setDrawerOpen, children }) {
  return (
    <div className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 transform ${drawerOpen ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300`}>
      <div className="bg-white w-full p-4">
        {children}
        <button onClick={() => setDrawerOpen(false)} className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
          Close
        </button>
      </div>
    </div>
  );
}