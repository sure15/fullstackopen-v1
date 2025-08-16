const Notification = ({ notificationMessage }) => {
    console.log(notificationMessage)
    if (notificationMessage) {
        return (
            <div className="notification">
                {notificationMessage}
            </div>
        )
    }
}

export default Notification