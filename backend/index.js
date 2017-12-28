const Alexa = require('alexa-sdk');
const moment = require("moment");

const APP_ID = 'amzn1.ask.skill.554f7f97-69da-43f3-a5b5-095a3e3bd3d9';
const categories = "regular, health, bills, car, entertainment, presents, clothes, other, yearly";
const HELP_MESSAGE = `Just say: ask financial to insert new cost with category (something) description (something) and amount (something) point (somehing). For categories ask: what are the categories.`;
const STOP_MESSAGE = 'Stopping';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    console.log("Expenses - executing");
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        console.log("Expenses - LaunchRequest");
        this.emit('AddExpenseIntent');
    },
    'Unhandled': function() {
        console.log("Expenses - Unhandled");
        this.response.speak("I do not know what you are saying double o seven");
        this.emit(':ask', 'There was an error. Check the logs.');
    },
    'AddExpenseIntent': function () {
        console.log("Expenses - AddExpenseIntent");

        if (!isSlotValid(this.event.request, "category")
            || !isSlotValid(this.event.request, "description")
            || !isSlotValid(this.event.request, "amountInteger")
            || !isSlotValid(this.event.request, "amountFraction")) {
                console.log("Expenses - AddExpenseIntent - delegate slot collection");
                delegateSlotCollection(this.event, this.emit);
        } else {

            console.log("Expenses - AddExpenseIntent - adding");

            const ExpenseService = require("./expenseService");

            let year = moment().year();
            let month = moment().month() + 1;
            let day = moment().date();
            let category = this.event.request.intent.slots.category.value;
            let description = this.event.request.intent.slots.description.value;
            let amountInteger = this.event.request.intent.slots.amountInteger.value;
            let amountFraction = this.event.request.intent.slots.amountFraction.value;

            let amount = parseFloat(amountInteger + '.' + amountFraction);

            let self = this;

            ExpenseService.insertExpense({ 
                    year: year, 
                    month: month, 
                    day: day, 
                    category: capitalizeFirstLetter(category), 
                    description: capitalizeFirstLetter(description), 
                    amount: amount })
                .then(function() { 
                    self.response.speak(`Inserted expense with category ${category}, description ${description} and amount ${amount}`);
                    self.emit(':responseReady');
                },
                function (err) { console.log(`InsertExpense has failed: ${err}`); });
        }
    },
    'Categories': function () {
        this.response.speak(`Categories: ${categories}`);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        this.response.speak(HELP_MESSAGE);
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

function delegateSlotCollection(event, emit){
    if (event.request.dialogState === "STARTED") {
        var updatedIntent = event.request.intent;
        emit(":delegate", updatedIntent);
    } else if (event.request.dialogState !== "COMPLETED") {
        emit(":delegate");
    }
}

function isSlotValid(request, slotName){
    return (
        request.intent 
            && request.intent.slots 
            && request.intent.slots[slotName] 
            && request.intent.slots[slotName].value);
}