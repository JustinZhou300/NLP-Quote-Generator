import * as tf from '@tensorflow/tfjs';
import word_index from './assets/model/word_index.js';
import first_word from './assets/model/first_word.js';
import reverse_word_index from './assets/model/reverse_word_index.js';

export default class App {

    constructor()
    {
        this.temperature = 0.2;
        this.sequence_length = 99;
        this.text = "";
        console.info('TensorFlow.Js version', tf.version['tfjs'])
        this.generateButton = document.getElementById("generate-button");
        this.generateButton.onclick = () => {
            this.generateText();
        }
        tf.loadLayersModel("./assets/model/model.json").then( (model) => {
            this.model = model;
            this.enableGeneration();
        })
        
    }

    enableGeneration() {
        this.generateButton.innerText = "Generate new text";
        this.generateButton.disabled = false;
        console.log("ready")
    }

    generateText(){
        this.text = "I";
        for (let i = 0; i < this.sequence_length + 1 ; i++){
            let sequence = this.text_to_sequence(this.text,this.sequence_length);
            let word = this.predict(sequence);
            this.text = `${this.text} ${word}`;
            if( word === "eom"){
                break;
            }
        }
        console.log(this.text)
    }

    padSequence(sequence, length, pre=true){
        const emptyArray = new Array(length - sequence.length ).fill(0);
        if (pre) {
            return emptyArray.concat(sequence);
        }
        else{
            return sequence.concat(emptyArray);
        }
    }

    printHello(){
        console.log("hello. Hi inside app.");
    }

    predict(input){
        const a = this.model.predict(input);
        const index = this.sample(a,this.temperature);
        const word = this.index_to_word(index);
        return word;
    }

    sample(tf_array,temperature) {
        return tf.tidy( () => {
            let a = tf_array.pow(tf.scalar(1/temperature));
            const p_sum = a.sum();
            a = a.div(p_sum);
          return this.random_choice(a);
    })};

    random_choice(tf_array){
        let sum = 0;
        const r = Math.random();
        const values = tf_array.dataSync();
        for (let i in values){
            sum += values[i];
            if ( r <= sum) return i;
        }
    }

    index_to_word(index){
        return reverse_word_index[index]
    }

    text_to_sequence(text,length,pre=true){
        let textSplit = text.toLowerCase().split(" ")
        let sequence = [];
        for (let i in textSplit){
            if (textSplit[i] in word_index){
                sequence.push(word_index[textSplit[i]]);
            }
            else{
                sequence.push(1);
            }
        }
        const paddedSequence = this.padSequence(sequence,length,pre)
        return tf.tensor(paddedSequence).expandDims(0);
    }

    sequence_to_text(sequence){
        let text = ""
        const sequenceArray = sequence.dataSync();
        for (let i in sequenceArray){
            if( sequenceArray[i] in reverse_word_index ){
                text = `${text} ${this.index_to_word(sequenceArray[i])}`;
            }
        }
        return text;
    }

}