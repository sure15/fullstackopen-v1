import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personService from './services/persons'
import Notification from './components/Notification'


const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')
  const [notificationMessage, setNotificationMessage] = useState({})

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
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const person = persons.find(p => p.name === newName)
        const changedPerson = { ...person, number: newNumber }

        personService
          .update(changedPerson.id, changedPerson)
          .then(returnedPerson => {
            setNotificationMessage({
              type: 'success',
              message: `${returnedPerson.name} number changed`
            })
            setTimeout(() => {
              setNotificationMessage(null)
            }, 5000);
            setPersons(persons.map(p => p.name === returnedPerson.name ? returnedPerson : p))
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            setNotificationMessage({
              type: 'error',
              message: `Information of ${changedPerson.name} has already been removed from server`
            })
            setTimeout(() => {
              setNotificationMessage(null)
            }, 5000);
            setPersons(persons.filter(p => p.name !== changedPerson.name))
            setNewName('')
            setNewNumber('')
          })
      }
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
          setNotificationMessage({
            type: 'success',
            message: `Added ${returnedPerson.name}`
          })
          setTimeout(() => {
            setNotificationMessage(null)
          }, 5000);
        })
        .catch(error => {
          setNotificationMessage({
            type: 'error',
            message: error.response.data.error
          })
          setTimeout(() => {
            setNotificationMessage(null)
          }, 5000);
        })
    }
  }

  const confirmDelete = (person) => {
    if (window.confirm(`Delete ${person.name} ?`)) {
      personService
        .deletePerson(person.id)
        .then(returnedPerson => {
          setPersons(persons.filter(p => person.id !== p.id))
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
      <Notification notificationMessage={notificationMessage} />
      <Filter newFilter={newFilter} handleFilterChange={handleFilterChange} />

      <h3>Add a new</h3>
      <PersonForm addPerson={addPerson} newName={newName} handleNameChange={handleNameChange} newNumber={newNumber} handleNumberChange={handleNumberChange} />

      <h3>Numbers</h3>
      <Persons filterPersons={filterPersons} confirmDelete={confirmDelete} />

    </div>
  )
}

export default App