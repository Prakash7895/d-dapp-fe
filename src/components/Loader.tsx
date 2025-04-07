import { FC } from 'react';
import { HashLoader } from 'react-spinners';

interface LoaderProps {
  size?: number;
}

const Loader: FC<LoaderProps> = ({ size = 48 }) => (
  <HashLoader size={size} color='#cf29de' />
);

export default Loader;
