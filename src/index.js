import App from './app.js';
import "./main.scss";

const app = new App();
let temp = app.text_to_sequence("HELLO world",99);
let temp2 = app.sequence_to_text(temp);

console.log(temp.dataSync())
console.log(temp2)


