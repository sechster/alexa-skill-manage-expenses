const Alexa = require('alexa-sdk');
const moment = require("moment");
const expenseService = require("./expenseService");

const APP_ID = 'amzn1.ask.skill.554f7f97-69da-43f3-a5b5-095a3e3bd3d9';
const categories = "regular, health, bills, car, entertainment, presents, clothes, other, yearly";
const HELP_MESSAGE = `Just say: ask the accountant to add new cost with category (something) description (something) and amount (something) point (somehing). For categories ask: what are the categories.`;
const STOP_MESSAGE = 'Ok.';

exports.handler = function(event, context, callback) {
    console.log("Expenses: executing");
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        console.log("Expenses: LaunchRequest");
        this.emit('AddExpenseIntent');
    },
    'Unhandled': function() {
        console.log("Expenses: Unhandled");
        this.emit(':tell', "I do not know what you are saying double o seven");
    },
    'AddExpenseIntent': function () {
        console.log("Expenses: AddExpenseIntent");

        if (!areAllSlotsValid(this.event.request)) {
            console.log("Expenses: AddExpenseIntent - delegate slot collection");
            delegateSlotCollection(this.event, this.emit);
        } else {
            console.log("Expenses: AddExpenseIntent - adding");

            let year = moment().year();
            let month = moment().month() + 1;
            let day = moment().date();

            let category = this.event.request.intent.slots.category.value;
            let description = this.event.request.intent.slots.description.value;
            let amountInteger = this.event.request.intent.slots.amountInteger.value;
            let amountFraction = this.event.request.intent.slots.amountFraction.value;
            let amount = parseFloat(amountInteger + '.' + ("0" + amountFraction).substr(-2));
            let accessToken = this.event.session.user.accessToken;

            let self = this;

            expenseService.insertExpense({ 
                    year: year, 
                    month: month, 
                    day: day, 
                    category: capitalizeFirstLetter(category), 
                    description: capitalizeFirstLetter(description), 
                    amount: amount },
                    accessToken)
                .then(function() { 
                    self.response.speak(`Inserted expense with category ${category}, description ${description} and amount ${amount}`);
                    self.emit(':responseReady');
                },
                function (err) { console.log(`InsertExpense has failed: ${err}`); });
        }
    },
    'CategoriesIntent': function () {
        console.log("Expenses: Categories");
        this.response.speak(`Categories: ${categories}`);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        console.log("Expenses: HelpIntent");
        this.response.speak(HELP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        console.log("Expenses: CancelIntent");
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        console.log("Expenses: StopIntent");
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

function areAllSlotsValid(request) {
    return isSlotValid(request, "category")
        && isSlotValid(request, "description")
        && isSlotValid(request, "amountInteger")
        && isSlotValid(request, "amountFraction");
}

function isSlotValid(request, slotName) {
    return (
        request.intent 
            && request.intent.slots 
            && request.intent.slots[slotName] 
            && request.intent.slots[slotName].value);
}