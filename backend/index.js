const Alexa = require('alexa-sdk');
const moment = require("moment");

const APP_ID = 'amzn1.ask.skill.554f7f97-69da-43f3-a5b5-095a3e3bd3d9';

const HELP_MESSAGE = 'Piss off';
const HELP_REPROMPT = 'Piss off';
const STOP_MESSAGE = 'Goodbye!';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('AddExpenseIntent');
    },
    'AddExpenseIntent': function () {
        const ExpenseService = require("./expenseService");

        let year = moment().year();
        let month = moment().month() + 1;
        let day = moment().date();

        let self = this;

        ExpenseService.insertExpense({ 
            year: year, 
            month: month, 
            day: day, 
            category: capitalizeFirstLetter(this.event.request.intent.slots.category.value), 
            description: capitalizeFirstLetter(this.event.request.intent.slots.description.value), 
            amount: this.event.request.intent.slots.amount.value })
        .then(function() { 
            self.response.speak("Expense inserted");
            self.emit(':responseReady');
        });

        //this.response.speak(speechOutput);
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
