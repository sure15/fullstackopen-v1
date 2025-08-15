import Person from './Person'

const Persons = ({ filterPersons, confirmDelete }) => {
    return (
        <div>
            {filterPersons.map(person => <Person key={person.id} person={person} confirmDelete={confirmDelete} />)}
        </div>
    )
}

export default Persons