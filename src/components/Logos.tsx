import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  src?: string;
  alt?: string;
}

/**
 * Logo YPI (Yayasan Pesantren Islam Al-Azhar)
 * Mengambil file gambar dari local path/URL internet (bukan vector generated).
 * Anda dapat menempatkan file logo asli di folder `/public/images/logo-alazhar.png` atau memberikan prop `src`.
 */
export const YpiLogo: React.FC<LogoProps> = ({
  className = '',
  size = 44,
  src = '/images/logo-alazhar.png', // Path/URL gambar asli Al-Azhar
  alt = 'Logo YPI Al-Azhar'
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-white border border-slate-200 rounded-full font-bold text-slate-800 shadow-sm ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        title={alt}
      >
        <span className="text-[10px] text-center leading-tight font-black text-[#be185d]">
          YPI
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setHasError(true)}
      className={`shrink-0 aspect-square object-contain ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    />
  );
};

/**
 * Logo YW (Yayasan Jam'iyyah Al-Azhar Grand Wisata)
 * Mengambil file gambar dari local path/URL internet (bukan vector generated).
 * Anda dapat menempatkan file logo asli di folder `/public/images/logo-yw.png` atau memberikan prop `src`.
 */
export const YwLogo: React.FC<LogoProps> = ({
  className = '',
  size = 44,
  src = '/images/logo-yw.png', // Path/URL gambar asli YW Al-Azhar
  alt = 'Logo YW Al-Azhar'
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-amber-100 border border-amber-300 rounded-full font-bold text-amber-950 shadow-sm ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        title={alt}
      >
        <span className="text-[10px] text-center leading-tight font-black text-amber-900">
          YW
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setHasError(true)}
      className={`shrink-0 aspect-square object-contain ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    />
  );
};


