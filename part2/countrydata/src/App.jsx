import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [countries, setCountries] = useState([])
  const [newFilter, setNewFilter] = useState('')
  const [filterCountries, setFilterCountries] = useState([])
  const [countryData, setCountryData] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        const countriesData = response.data.map(obj => obj.name.common)
        setCountries(countriesData)
      })

  }, [])

  useEffect(() => {
    const filter = countries.filter(country => country.toLowerCase().includes(newFilter.toLowerCase()))
    setFilterCountries(filter)
    if (filter.length === 1) {
      axios
        .get(`https://studies.cs.helsinki.fi/restcountries/api/name/${filter[0]}`)
        .then(response => {
          setCountryData(response.data)
        })
    }

  }, [newFilter])


  const handleFilterChange = (event) => {
    setNewFilter(event.target.value)
  }

  const showCountry = (country) => {
    setFilterCountries([country])
    axios
      .get(`https://studies.cs.helsinki.fi/restcountries/api/name/${country}`)
      .then(response => {
        setCountryData(response.data)
      })
  }

  return (
    <>
      find countries <input value={newFilter} onChange={handleFilterChange} />
      {filterCountries.length > 10 ? <div>Too many matches, specify another filter</div> : null}
      {filterCountries.length > 1 && filterCountries.length <= 10 ? filterCountries.map(country => <p key={country}>{country} <button onClick={() => showCountry(country)}>show</button> </p>) : null}
      {filterCountries.length === 1 && countryData ? <div>
        <h1>{countryData.name.common}</h1>
        <p>Capital {countryData.capital}</p>
        <p>Area {countryData.area}</p>
        <h2>Languages</h2>
        <p>{Object.values(countryData.languages)}</p>
        <img src={countryData.flags.png} alt={countryData.name.common} />
      </div> : null}

    </>
  )
}

export default App
