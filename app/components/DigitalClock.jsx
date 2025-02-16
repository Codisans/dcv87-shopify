import {useEffect, useState} from 'react';

export const DigitalClock = () => {
  const [time, setTime] = useState('00:00:00');

  const getDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('default', {month: 'short'});
    const year = String(now.getFullYear()).slice(-2);
    return `${day} ${month} ${year}`;
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    const intervalId = setInterval(updateClock, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <span>
      {getDate()} {time}
    </span>
  );
};
