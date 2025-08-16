const Notification = ({ notificationMessage }) => {
    console.log(notificationMessage)
    if (!notificationMessage) {
        return null
    } else if (notificationMessage.type === 'success') {
        return (
            <div className="successNotification">
                {notificationMessage.message}
            </div>
        )
    } else if (notificationMessage.type === 'error') {
        return (
            <div className="errorNotification">
                {notificationMessage.message}
            </div>
        )
    }
}

export default Notification