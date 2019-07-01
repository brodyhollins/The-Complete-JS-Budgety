//BUDGET CONTROLLER
var budgetController = (function () {
    //Function Constructors that will hold the unique ID of the object, description and value
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }


    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        //public function to recieve and compare values
        addItem: function (type, des, val) {
            var newItem, ID;
            /* ID will be the last value in the array +1
            So we will need to get the length of the array and minus 1 to get the position of the last element
            We will get the last id and add 1 to give the newItem a new unique ID
            */
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }

            //test to see if exp or inc type is passed in and create an object on the value
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }
            //taking the type which will be inc or exp and this will be passed in the [] to select the array we want to populate and put the newItem at the end of the array
            data.allItems[type].push(newItem);
            //Return the new element
            return newItem;
        },
        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate percentage expense / income * 100
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    };
})();

//UI CONTROLLER
var UIController = (function () {
    //Object to store the private variables, so if a class is changed we can change it in one place to reduce bugs
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };
    var formatNumber = function (num, type) {
        var numSplit, int, dec, sign;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        return (type === 'exp' ? sign = "-" : sign = "+") + " " + int + "." + dec;
    };
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    return {
        getInput: function () {
            return {
                //Get the values from our input fields
                type: document.querySelector(DOMstrings.inputType).value,// Will be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            //Create HTML string with placeholder text
            //%id% is just a placeholder so we can change that value with an actual value we are getting
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            //converting fields which is a list into an array
            fieldsArr = Array.prototype.slice.call(fields);
            //
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            //Focus it on the first field to type in
            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            obj.budget > 0 ? type = "inc" : type = "exp";

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, "exp");
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                }
                else {
                    current.textContent = percentages[index] + "---";
                }
            });

        },
        displayMonth: function () {
            var now, year, month, months;

            var now = new Date();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        },
        changeType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + "," +
                DOMstrings.inputDescription + "," +
                DOMstrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle("red-focus");
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        },
        //Create a public function that returns the DOMstrings so we can use them in our other modules
        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();

//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        //Variable to hold the DOMstrings so we can use it to access the values
        var DOM = UICtrl.getDOMstrings();
        //When the check button is clicked run the function
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (event) {
            //This tests to see if the user clicks ENTER, the .which is for older browsers
            if ((event.keyCode === 13) || (event.which === 13)) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType);
    };

    var updateBudget = function () {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        //1. Calculate the %
        budgetCtrl.calculatePercentages();
        //2. Read them from Budget Controller
        var percentages = budgetCtrl.getPercentages();
        //3. Update UI
        UICtrl.displayPercentages(percentages);

    };

    //Function that will excute what needs to be done if the button or ENTER is clicked
    var ctrlAddItem = function () {
        var input, newItem;
        //1. Get the field input data
        input = UICtrl.getInput();

        if ((input.description !== "") && (!isNaN(input.value)) && (input.value > 0)) {
            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //3. Add the new item to the UI
            UICtrl.addListItem(newItem, input.type);
            //4. Clear the fields
            UICtrl.clearFields();
            //5. Calculate and update budget
            updateBudget();
            //6. Update Percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            //2. Delete from UI
            UICtrl.deleteListItem(itemID);
            //3. Update and show the new totals and budget
            updateBudget();
            //4. Update Percentages
            updatePercentages();

        }
    };

    return {
        init: function () {
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
            UICtrl.displayMonth();

        }
    }
})(budgetController, UIController);

controller.init();