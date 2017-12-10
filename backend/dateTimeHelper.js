module.exports = (function dateTimeHelperModule()
{
    let moment = require("Moment");
    
    function getCurrentYear()
    {
        return moment().year();
    }
    
    function getCurrentMonth()
    {
        let month = moment().month() + 1;
        return ("0" + month).substr(-2);
    }
    
    function getCurrentDay()
    {
        return moment().date();
    }

    let publicAPI = {
        getCurrentYear: getCurrentYear,
        getCurrentMonth: getCurrentMonth,
        getCurrentDay: getCurrentDay
    };

    return publicAPI;
})();