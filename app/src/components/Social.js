import React from 'react'
import { SOCIAL_LINKS } from '../_globalConfig/socialLinks'

export const SocialLinks = ({ small, hideOnMobile, gap, invert }) => (
  <div className={`flex ${gap ? `gap-${gap}` : 'gap-0'} ${hideOnMobile ? 'hidden md:flex' : 'flex'}`}>
    {Object.keys(SOCIAL_LINKS).map(platform => (
      <a
        key={`plt_link_${SOCIAL_LINKS[platform]?.url}`}
        href={SOCIAL_LINKS[platform]?.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center rounded-full border border-white p-2 hover:bg-gray-200"
      >
        <img src={SOCIAL_LINKS[platform]?.icon_img} alt={platform} className={`${small ? 'w-4 h-4' : 'w-6 h-6'} ${invert ? 'filter invert' : ''}`} />
      </a>
    ))}
  </div>
)