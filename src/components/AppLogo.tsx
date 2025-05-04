import React, { FC } from 'react';
import AppName from './AppName';

interface AppLogoProps {
  className?: string;
  imageWidth?: string;
  imageHeight?: string;
  showText?: boolean;
  logoClassName?: string;
  shadowSpread?: number;
}

const AppLogo: FC<AppLogoProps> = ({
  className,
  imageHeight = '10rem',
  imageWidth = '18rem',
  showText = true,
  logoClassName = 'text-5xl',
  shadowSpread = 30,
}) => {
  return (
    <header className={className}>
      <img
        src='/logo.png'
        alt='App Logo'
        className='object-cover object-center'
        style={{
          filter: `drop-shadow(rgba(207, 41, 222, 0.7) 0px 0px ${shadowSpread}px)`,
          height: imageHeight,
          width: imageWidth,
        }}
      />
      <AppName className={logoClassName} />
      {showText && (
        <span className='text-primary-50'>Decentralized Dating App</span>
      )}
    </header>
  );
};

export default AppLogo;
