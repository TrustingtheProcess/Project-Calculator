const keys = document.querySelectorAll(".key");
const displayInput = document.querySelector(".display .input");
const displayOutput = document.querySelector(".display .output");

let input = "";

// Handle keypress for calculator buttons
for (let key of keys) {
  const value = key.dataset.key;


  key.addEventListener("click", () => {
    if (value == "clear") {
      input = "";
      displayInput.innerHTML = "";
      displayOutput.innerHTML = "";
    } else if (value == "backspace") {
      input = input.slice(0, -1);
      displayInput.innerHTML = cleanInput(input);
    } else if (value == "=") {
      let result = operate(prepareInput(input));
      displayOutput.innerHTML = cleanOutput(result);
    } else if (value == "brackets") {
      if (
        input.indexOf("(") == -1 ||
        input.indexOf("(") != -1 &&
        input.indexOf(")") != -1 &&
        input.lastIndexOf("(") < input.lastIndexOf(")")
      ) {
        input += "(";
      } else if (
        input.indexOf("(") != -1 &&
        input.indexOf(")") == -1 ||
        input.indexOf("(") != -1 &&
        input.indexOf(")") != -1 &&
        input.lastIndexOf("(") > input.lastIndexOf(")")
      ) {
        input += ")";
      }

      displayInput.innerHTML = cleanInput(input);
    } else {
      if (validateInput(value)) {
        input += value;
        displayInput.innerHTML = cleanInput(input);
      }
    }
  });
}

// Keyboard Support
document.addEventListener("keydown", (e) => {
  let key = e.key;

   // Handle special cases for operators with Shift keys 
   if (e.shiftKey && key === "8") {
    key = "*";  // Shift + 8 for *
  } else if (e.shiftKey && key === "=") {
    key = "+";  // Shift + = for +
  } else if (e.shiftKey && key === "9") {
    key = "(";  // Shift + 9 for (
  } else if (e.shiftKey && key === "0") {
    key = ")";  // Shift + 0 for )
  }

   // Check for "." key to prevent multiple decimal points in the same number
   if (key === ".") {
     // If the current input is empty, start the number with "0." (Allows user to start with ".")
    if (input.length === 0) {
      input = "0.";
      displayInput.innerHTML = cleanInput(input);
      return;
    }

    // Find the last operator in the input to get the current number
    let lastOperatorIndex = Math.max(input.lastIndexOf("+"), input.lastIndexOf("-"), input.lastIndexOf("*"), input.lastIndexOf("/"));
    let currentNumber = input.slice(lastOperatorIndex + 1); // Get the part of the input after the last operator
    
    // If there's already a decimal point in the current number, prevent adding another one
    if (currentNumber.includes(".")) {
      e.preventDefault();  // Stop the default action of adding a "."
      return;
    }
  }
   
  if (!isNaN(key) || key === "+" || key === "-" || key ==="*" || key === "/" || key === "%" || key === ".") {
    input += key;
    displayInput.innerHTML = cleanInput(input);
  } else if (key === "Backspace" || key === "Delete") { 
    input = input.slice(0, -1);
    displayInput.innerHTML = cleanInput(input);
  } else if (key === "Enter") {
    let result = operate(prepareInput(input));
    displayOutput.innerHTML = cleanOutput(result);
  } else if (key === "(" || key === ")") {
    input += key;
    displayInput.innerHTML = cleanInput(input);
  } else if (key === "Escape") {
    input = "";
    displayInput.innerHTML = "";
    displayOutput.innerHTML = "";
  }
});

function cleanInput(input) {
  let inputArray = input.split("");
  let inputArrayLength = inputArray.length;

  for (let i = 0; i < inputArrayLength; i++) {
    if (inputArray[i] == "*") {
      inputArray[i] = ` <span class="operator">x</span> `;
    } else if (inputArray[i] == "/") {
      inputArray[i] = ` <span class="operator">÷</span> `;
    } else if (inputArray[i] == "+") {
      inputArray[i] = ` <span class="operator">+</span> `;
    } else if (inputArray[i] == "-") {
      inputArray[i] = ` <span class="operator">-</span> `;
    } else if (inputArray[i] == "(") {
      inputArray[i] = ` <span class="brackets">(</span> `;
    } else if (inputArray[i] == ")") {
      inputArray[i] = ` <span class="brackets">)</span> `;
    } else if (inputArray[i] == "%") {
      inputArray[i] = ` <span class="percent">%</span> `;
    }
  }

  return inputArray.join("");
}

function cleanOutput(output) {
  let outputString = output.toString();
  let decimal = outputString.split(".") [1];
  outputString = outputString.split(".") [0];

  let outputArray = outputString.split("");
    if (outputArray.length > 3) {
      for (let i = outputArray.length - 3; i > 0; i-= 3) {
        outputArray.splice(i, 0, ",");
      }
    }

  if (decimal) {
    outputArray.push(".");
    outputArray.push(decimal);
  }

  return outputArray.join("");
}

function validateInput(value) {
  let lastInput = input.slice(-1);
  let operators = ["+", "-", "*", "/"];
  
  // Allow first input to be "+" or "-" 
  if (input.length === 0 && (value === "+" || value === "-")) {
    return true;
  }
  
  // Prevent starting the input with "*" or "/"
  if (input.length === 0 && (value === "*" || value === "/")) {
    return false;
  }

  // Prevent multiple decimal points in a single number
  if (value == "." && lastInput == ".") {
    return false;
  }
 
  // Prevent two operators in a row 
  if (operators.includes(value) && operators.includes(lastInput)) {
    return false; 
  }
  
  return true;
}

function prepareInput(input) {
  let inputArray = input.split("");

  for (let i = 0; i < inputArray.length; i++) {
    if (inputArray[i] == "%") {
      inputArray[i] = "/100";
    }
    // Handle implicit multiplication, where a number is directly followed by (
    if (!isNaN(inputArray[i])  && inputArray[i + 1] == "(") {
      inputArray.splice(i + 1, 0, "*"); 
    }
  }
  return inputArray.join("");
}

function operate(input) {
  //Handle parentheses first following PEMDAS
  while (input.includes("(")) {
    input = input.replace(/\(([^()]+)\)/, (_, innerExpression) =>
    operate(innerExpression));
  }

  // Handle a positive/negative number at the start
  if (input[0] === "-" || input[0] === "+") {
    input = "0" + input;  
  }

  //Split numbers and operators
  let operandsAndOperators = parseExpression(input);

  //Handle Multiplication and division first (precendence)
  for (let i = 0; i < operandsAndOperators.length; i++) {
    if (operandsAndOperators[i] === "*" || operandsAndOperators[i] === "/") {
      let left = parseFloat(operandsAndOperators[i - 1]);
      let right = parseFloat(operandsAndOperators[i + 1]);
      let result = operandsAndOperators[i] === "*" ? left * right : left / right;
      operandsAndOperators.splice(i - 1, 3, result); // Replace operands and operators with result
      i--;
    }
  }
  
  //Handle addition and subtraction
  for (let i = 0; i < operandsAndOperators.length; i++) {
    if (operandsAndOperators[i] === "+" || operandsAndOperators[i] === "-") {
      let left = parseFloat(operandsAndOperators[i - 1]);
      let right = parseFloat(operandsAndOperators[i + 1]);
      let result = operandsAndOperators[i] === "+" ? left + right : left - right;
      operandsAndOperators.splice(i - 1, 3, result);
      i--;
    }
  }

  return operandsAndOperators[0];
}

function parseExpression(input) {
  let regex = /([+\-*/])|(\d+(\.\d+)?)/g;
  return input.match(regex)
};