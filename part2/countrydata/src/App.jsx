import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [countries, setCountries] = useState([])
  const [newFilter, setNewFilter] = useState('')
  const [display, setDisplay] = useState(false)
  const [countryData, setCountryData] = useState(null)
  const [weather, setWeather] = useState(null)
  const api_key = import.meta.env.VITE_SOME_KEY


  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        const countriesData = response.data.map(obj => obj.name.common)
        setCountries(countriesData)
      })

  }, [])

  const handleFilterChange = (event) => {
    setNewFilter(event.target.value)
  }

  let filterCountries = newFilter ? countries.filter(country => country.toLowerCase().includes(newFilter.toLowerCase())) : []

  useEffect(() => {
    if (filterCountries.length === 1) {
      setDisplay(true)
      axios
        .get(`https://studies.cs.helsinki.fi/restcountries/api/name/${filterCountries[0]}`)
        .then(response => {
          const data = response.data
          setCountryData(data)
          const latlng = data.capitalInfo.latlng
          axios
            .get(`https://api.openweathermap.org/data/2.5/weather?lat=${latlng[0]}&lon=${latlng[1]}&appid=d1e53277a5d498e045f7574079b09b3a`)
            .then(response => {
              console.log(response.data)
              setWeather(response.data)
            })
        })
    } else {
      setDisplay(false)
    }

  }, [newFilter])

  const showCountry = (country) => {
    setDisplay(true)
    axios
      .get(`https://studies.cs.helsinki.fi/restcountries/api/name/${country}`)
      .then(response => {
        const data = response.data
        setCountryData(data)
        const latlng = data.capitalInfo.latlng
        axios
          .get(`https://api.openweathermap.org/data/2.5/weather?lat=${latlng[0]}&lon=${latlng[1]}&appid=${api_key}`)
          .then(response => {
            setWeather(response.data)
          })
      })

  }



  return (
    <>
      find countries <input value={newFilter} onChange={handleFilterChange} />
      {filterCountries.length > 10 ? <div>Too many matches, specify another filter</div> : null}
      {filterCountries.length > 1 && filterCountries.length <= 10 ? filterCountries.map(country => <p key={country}>{country} <button onClick={() => showCountry(country)}>show</button> </p>) : null}
      {display && countryData ? <div>
        <h1>{countryData.name.common}</h1>
        <p>Capital {countryData.capital}</p>
        <p>Area {countryData.area}</p>
        <h2>Languages</h2>
        <p>{Object.values(countryData.languages)}</p>
        <img src={countryData.flags.png} alt={countryData.name.common} />
        <h2>Weather in {countryData.capital}</h2>
        <p>Temperature {weather ? (weather.main.temp - 273.15).toFixed(2) : null} Celsius</p>
        <img src={weather ? `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png` : null} />
        <p>Wind {weather ? weather.wind.speed : null} m/s</p>
      </div> : null}

    </>
  )
}

export default App
