import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personService from './services/persons'


const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')

  useEffect(() => {
    // console.log('effect')
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])
  // console.log('render', persons.length, 'persons')


  const addPerson = (event) => {
    event.preventDefault()

    if (persons.some(person => person.name === newName)) {
      alert(`${newName} is already added to phonebook`)
    } else {
      const personObject = {
        name: newName,
        number: newNumber,
        id: String(persons.length + 1)
      }
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
        })
    }
  }

  const confirmDelete = (person) => {
    if (window.confirm(`Delete ${person.name} ?`)) {
      personService
        .deletePerson(person.id)
        .then(returnedPerson => {
          setPersons(persons.filter(p => returnedPerson.id !== p.id))
        })
    }
  }

  const handleNameChange = (event) => {
    // console.log('handleNameChange event', event.target.value)
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    // console.log('handleNumberChange event', event.target.value)
    setNewNumber(event.target.value)
  }

  const filterPersons = persons.filter(person => person.name.toLowerCase().includes(newFilter.toLowerCase()))

  const handleFilterChange = (event) => {
    // console.log('handleFilterChange event', event.target.value)
    setNewFilter(event.target.value)
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter newFilter={newFilter} handleFilterChange={handleFilterChange} />

      <h3>Add a new</h3>
      <PersonForm addPerson={addPerson} newName={newName} handleNameChange={handleNameChange} newNumber={newNumber} handleNumberChange={handleNumberChange} />

      <h3>Numbers</h3>
      <Persons filterPersons={filterPersons} confirmDelete={confirmDelete} />

    </div>
  )
}

export default App