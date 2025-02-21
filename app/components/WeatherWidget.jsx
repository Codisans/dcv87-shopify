import {Await, useLocation} from '@remix-run/react';
import {Suspense, useEffect, useRef, useState} from 'react';
import {DigitalClock} from './DigitalClock';

let isHydrating = true;

export const WeatherWidget = () => {
  const {pathname} = useLocation();
  const [isHydrated, setIsHydrated] = useState(!isHydrating);
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);

    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json');
        const jsonData = await response?.json();
        setLocation(jsonData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=43d52268fed04e378c6152940251602&q=${location.city}&aqi=no`,
        );
        const jsonData = await response?.json();
        setWeatherData(jsonData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchWeather();
  }, [location]);

  if (!weatherData || !isHydrated) return;

  return (
    <div
      className={`fixed left-gutter bottom-10 sm:bottom-12 lg:bottom-14 z-header text-small font-courier select-none text-green transition-opacity duration-300 ease-in-out ${
        pathname.includes('products')
          ? 'opacity-0 pointer-events-none'
          : 'opacity-100'
      }`}
    >
      <div className="flex flex-col gap-1 relative z-header overlay-trigger">
        <DigitalClock />
        <span>
          {location.city}, {location.country_name}
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
