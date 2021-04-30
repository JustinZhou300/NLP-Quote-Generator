import * as tf from '@tensorflow/tfjs';
import word_index from './assets/model/word_index.js';
import first_word from './assets/model/first_word.js';

export default class App {

    constructor()
    {
        console.log("in constructor")
        console.info('TensorFlow.Js version', tf.version['tfjs'])
        this.generateButton = document.getElementById("generate-button");
        this.generateButton.onclick = () => {
            this.predict("");
        }
        tf.loadLayersModel("./assets/model/model.json").then( (model) => {
            this.model = model ;
            this.enableGeneration();
        })
        
    }

    enableGeneration() {
        this.generateButton.innerText = "Generate new text";
        this.generateButton.disabled = false;
        console.log("ready")
      }

    printHello(){
        console.log("hello. Hi inside app.");
    }

    predict(input){
        this.model.predict(tf.ones([1, 99])).print();
    }



}