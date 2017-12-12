module.exports = (function dateTimeHelperModule()
{
    let moment = require("Moment");
    
    function getCurrentYear()
    {
        return moment().year();
    }
    
    function getCurrentDay()
    {
        return moment().date();
    }

    let publicAPI = {
        getCurrentYear: getCurrentYear,
        getCurrentDay: getCurrentDay
    };

    return publicAPI;
})();