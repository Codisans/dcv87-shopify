import {Await, useLocation} from '@remix-run/react';
import {Suspense, useEffect, useRef, useState} from 'react';
import {DigitalClock} from './DigitalClock';

export const WeatherWidget = ({ip}) => {
  const {pathname} = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    if (weatherData) return;

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=43d52268fed04e378c6152940251602&q=auto:ip&aqi=no`,
        );
        const jsonData = await response?.json();
        setWeatherData(jsonData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchWeather();
  }, []);

  useEffect(() => {
    setIsVisible(!pathname.includes('products'));
  }, [pathname]);

  if (!weatherData) return;

  return (
    <div
      className={`z-header text-small font-courier select-none text-green transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col gap-1 relative z-header overlay-trigger">
        <DigitalClock />
        <span>
          {weatherData?.location?.name}, {weatherData?.location?.country}
        </span>
        <div className="flex flex-nowrap gap-1 items-center">
          <span>{weatherData?.current?.temp_c} &deg;C</span>
          <img
            className="w-8 h-8 lg:w-10 lg:h-10 -my-2"
            src={weatherData?.current?.condition.icon}
            alt={weatherData?.current?.condition.text}
          />
        </div>
      </div>
    </div>
  );
};
