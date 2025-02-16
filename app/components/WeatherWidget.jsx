import {Await} from '@remix-run/react';
import {Suspense, useEffect, useState} from 'react';

export const WeatherWidget = ({ip}) => {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(`https://ipwho.is/${ip}`);
        const jsonData = await response?.json();
        const city = jsonData.city;
        setLocation(city);
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
          `https://api.weatherapi.com/v1/current.json?key=43d52268fed04e378c6152940251602&q=${location}&aqi=no`,
        );
        const jsonData = await response?.json();
        setWeatherData(jsonData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchWeather();
  }, [location]);

  if (!weatherData) return;

  return (
    <div className="fixed left-gutter bottom-8 sm:bottom-10 lg:bottom-12 z-50 text-small font-courier">
      <div className="flex flex-nowrap gap-1 items-center">
        <span>{location}</span>
        <img
          className="w-8 h-8 lg:w-10 lg:h-10"
          src={weatherData?.current?.condition.icon}
          alt={weatherData?.current?.condition.text}
        />
        <span>{weatherData?.current?.temp_c} &deg;C</span>
      </div>
    </div>
  );
};
