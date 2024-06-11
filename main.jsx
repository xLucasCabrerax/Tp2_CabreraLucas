const { useState, useEffect } = React;

function App() {
    const [city, setCity] = useState('Buenos Aires');
    const [weatherData, setWeatherData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [cityHistory, setCityHistory] = useState([]);

    const predefinedCities = ['Tucuman', 'Salta', 'Buenos Aires'];

    const fetchWeather = async (cityName) => {
        const apiKey = '30d38b26954359266708f92e1317dac0';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=es`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod !== 200) {
                throw new Error(data.message);
            }
            setWeatherData(data);
            setErrorMessage('');
            await saveCityToHistory(cityName); // Guardar ciudad en la base de datos
        } catch (error) {
            console.error('Error fetching weather data:', error);
            setWeatherData(null);
            setErrorMessage('Ciudad no encontrada. Por favor, intenta con otra.');
        }
    };

    const saveCityToHistory = async (cityName) => {
        try {
            const response = await fetch('http://localhost:5000/api/cities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: cityName }),
            });
            const result = await response.json();
            console.log('City saved to history:', result);
            fetchCityHistory(); // Actualiza el historial después de guardar
        } catch (error) {
            console.error('Error saving city to history:', error);
        }
    };

    const fetchCityHistory = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/cities');
            const result = await response.json();
            setCityHistory(result);
        } catch (error) {
            console.error('Error fetching city history:', error);
        }
    };

    useEffect(() => {
        if (city) {
            fetchWeather(city);
        }
        fetchCityHistory(); // Cargar historial al montar el componente
    }, [city]);

    const handleSearch = (event) => {
        event.preventDefault();
        const cityName = event.target.elements.search.value.trim();
        setCity(cityName);
    };

    const getWeatherIcon = (iconCode) => {
        return `./openweathermap/${iconCode}.svg`;
    };

    return (
        <div>
            <header>
                <h1>Clima</h1>
                <nav>
                    {predefinedCities.map((cityName) => (
                        <a key={cityName} href="#" onClick={() => setCity(cityName)}>
                            {cityName}
                        </a>
                    ))}
                </nav>
            </header>
            <main>
                <form onSubmit={handleSearch}>
                    <input
                        type="search"
                        name="search"
                        placeholder="Buscar"
                        aria-label="Buscar"
                    />
                </form>
                {errorMessage && <p className="error">{errorMessage}</p>}
                {weatherData && (
                    <div id="weatherContainer">
                        <h2>{weatherData.name}</h2>
                        <img
                            id="weatherIcon"
                            src={getWeatherIcon(weatherData.weather[0].icon)}
                            alt="Weather Icon"
                        />
                        <p><b>Temperatura: {weatherData.main.temp}°C</b></p>
                        <p>Mínima: {weatherData.main.temp_min}°C / Máxima: {weatherData.main.temp_max}°C</p>
                        <p>Humedad: {weatherData.main.humidity}%</p>
                    </div>
                )}
                <div id="historyContainer">
                    <h2>Historial de Búsquedas</h2>
                    <ul>
                        {cityHistory.map((entry) => (
                            <li key={entry._id}>{entry.name} - {new Date(entry.date).toLocaleString()}</li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);