
const Person = ({ person, confirmDelete }) => {


    return (
        <div>
            {person.name} {person.number}
            <button onClick={() => confirmDelete(person)}>delete</button>
        </div >
    )
}

export default Person