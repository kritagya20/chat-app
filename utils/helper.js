import moment from 'moment';

export const formatDate = (date) =>{
    const now = new Date(); //getting present date
    const diff = now.getTime() - date.getTime(); //getting the difference between present and the message date

    //difference is less than a min
    if (diff < 60000 ) {
        return "now"
    }

    //difference is less than an hour
    if (diff < 3600000) {
        return `${Math.round(diff/ 60000)} min ago`
    }

    //difference is less than a day
    if (diff < 86400000) {
        return moment(date).format('h:mm A')
    }

    //difference more than a day
    return moment(date).format('DD/MM/YYYY')
}