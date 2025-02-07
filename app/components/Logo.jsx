import {Symbol} from './Symbol';

export const Logo = ({animated = false}) => {
  return (
    <div className={`logo ${animated ? 'animated' : ''}`}>
      {animated ? (
        <div>
          {Array.from({length: 16}).map((_, index) => (
            <Symbol key={index} name="logo" />
          ))}
        </div>
      ) : (
        <Symbol name="logo" />
      )}
    </div>
  );
};
