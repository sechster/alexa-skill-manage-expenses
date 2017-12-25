const Alexa = require('alexa-sdk');
const moment = require("moment");

const APP_ID = 'amzn1.ask.skill.554f7f97-69da-43f3-a5b5-095a3e3bd3d9';
const categories = "regular, health, bills, car, entertainment, presents, clothes, other, yearly";
const HELP_MESSAGE = `Just say ask expense manager to add new expense with category (something) description (something) and amount (something). Categories are: ${categories}.`;
const STOP_MESSAGE = 'Stopping';

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
        if (!isSlotValid(this.event.request, "category")
            || !isSlotValid(this.event.request, "description")
            || !isSlotValid(this.event.request, "amount")) {
                delegateSlotCollection(this.event, this.emit);
        } else {
            const ExpenseService = require("./expenseService");

            let year = moment().year();
            let month = moment().month() + 1;
            let day = moment().date();
            let category = this.event.request.intent.slots.category.value;
            let description = this.event.request.intent.slots.description.value;
            let amount = this.event.request.intent.slots.amount.value;

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
    var slot = request.intent.slots[slotName];
    return (slot && slot.value);
}