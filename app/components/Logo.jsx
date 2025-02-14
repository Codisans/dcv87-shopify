import {Symbol} from './Symbol';

export const Logo = () => {
  return (
    <span className="logo">
      <span className="logo--dcv">
        {Array.from({length: 16}).map((_, index) => (
          <Symbol className="absolute inset-0" key={index} name="logo" />
        ))}
      </span>
      <span className="logo--tagline">
        {Array.from({length: 16}).map((_, index) => (
          <span key={index}>By Lucien Clarke</span>
        ))}
      </span>
    </span>
  );
};
