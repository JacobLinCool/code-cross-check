# Create Your Own Preprocessor

You can use JavaScript to create your own preprocessor.

It is really simple:

```js
// You can use this template
module.exports = (output) => {
    return output.stdout.match(/[+-]?(\d*[.])?\d+/g).join(" ");
};
```

output consists of an object with the following properties:

- **stdout**: the standard output of the program. (string)
- **code**: the exit code of the program. (number)
- **time**: the time it took to run the program. (number)

Your preprocessor must return a string that will be used to compare with other outputs.
