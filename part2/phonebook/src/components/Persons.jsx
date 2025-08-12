import Person from './Person'

const Persons = ({ filterPersons }) => {
    return (
        <div>
            {filterPersons.map(person => <Person key={person.name} person={person} />)}
        </div>
    )
}

export default Persons