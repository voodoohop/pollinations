import React from "react";
import { NavLink } from "react-router-dom";
import TemporaryDrawer from "./Drawer";
import { SocialLinks } from "./Social"; // Ensure correct import

const TopBar = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    const link = e.currentTarget.href;
    navigator.clipboard.writeText(link).then(() => {
      console.log(`Copied to clipboard: ${link}`);
    });
  };

  return (
    <div className="w-full bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <NavLink to="/" className="text-xl font-bold text-black" onClick={(e) => e.preventDefault()}>
          Pollinations
        </NavLink>
        <div className="hidden md:flex space-x-4">
          <SocialLinks small hideOnMobile gap="1em" invert />
          <button onClick={handleDrawerToggle} className="md:hidden">
            {/* Mobile Menu Icon */}
          </button>
        </div>
        <button onClick={handleDrawerToggle} className="md:hidden">
          {/* Hamburger Icon */}
        </button>
      </div>
      <TemporaryDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}>
        <div className="flex flex-col items-center space-y-4 p-4">
          <button onClick={() => setDrawerOpen(false)} className="self-end">
            Close
          </button>
          <a href="/impressum" onClick={handleLinkClick} className="text-lg">Impressum</a>
          <a href="/terms" onClick={handleLinkClick} className="text-lg">Terms</a>
          {/* Add more links as needed */}
        </div>
      </TemporaryDrawer>
    </div>
  );
};

export default TopBar;
