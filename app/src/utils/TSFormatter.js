class TSFormatter {
    constructor(){}

    getDateTime(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours() < 10? '0' + a.getHours():a.getHours();
        var min = a.getMinutes() < 10? '0' + a.getMinutes():a.getMinutes();
        var sec = a.getSeconds() < 10? '0' + a.getSeconds():a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    }

    dateToTimestamp (dateStr) {
        return new Date(dateStr).getTime() / 1000;
    }
}

export default TSFormatter;